pipeline {
    agent any

    environment {
        AWS_REGION         = 'us-east-1'
        S3_FRONTEND_BUCKET = credentials('S3_FRONTEND_BUCKET')   // static-assets bucket name
        EC2_HOST           = credentials('EC2_HOST')              // ALB DNS or EC2 private IP
        EC2_USER           = 'ec2-user'
        DEPLOY_PATH        = '/opt/webapp/backend'
    }

    stages {

        // ── 1. Checkout ──────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT}"
            }
        }

        // ── 2. Backend — install & test ───────────────────────────────────────
        stage('Backend: Test') {
            steps {
                dir('backend') {
                    sh '''
                        python3 -m venv .venv
                        . .venv/bin/activate
                        pip install --quiet -r requirements.txt
                        python manage.py test --verbosity=2
                    '''
                }
            }
        }

        // ── 3. Frontend — install, test, build ────────────────────────────────
        stage('Frontend: Build') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci --silent
                        npm test
                        VITE_API_BASE_URL=http://${EC2_HOST} npm run build
                    '''
                }
            }
        }

        // ── 4. Deploy Frontend to S3 ──────────────────────────────────────────
        stage('Deploy: Frontend → S3') {
            when { branch 'main' }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials'
                ]]) {
                    sh '''
                        aws s3 sync frontend/dist/ s3://${S3_FRONTEND_BUCKET}/ \
                            --region ${AWS_REGION} \
                            --delete \
                            --cache-control "max-age=31536000" \
                            --exclude "index.html"

                        aws s3 cp frontend/dist/index.html s3://${S3_FRONTEND_BUCKET}/index.html \
                            --region ${AWS_REGION} \
                            --cache-control "no-cache, no-store, must-revalidate"
                    '''
                }
            }
        }

        // ── 5. Deploy Backend to EC2 ──────────────────────────────────────────
        stage('Deploy: Backend → EC2') {
            when { branch 'main' }
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY'),
                    string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'SECRET_KEY', variable: 'SECRET_KEY'),
                    string(credentialsId: 'DB_HOST', variable: 'DB_HOST'),
                    string(credentialsId: 'S3_BUCKET_NAME', variable: 'S3_BUCKET_NAME')
                ]) {
                    sh '''
                        # Copy backend source to EC2
                        rsync -az --delete \
                            -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no" \
                            backend/ ${EC2_USER}@${EC2_HOST}:${DEPLOY_PATH}/

                        # Run migrations and restart gunicorn
                        ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << EOF
                            export SECRET_KEY="${SECRET_KEY}"
                            export DB_PASSWORD="${DB_PASSWORD}"
                            export DB_HOST="${DB_HOST}"
                            export S3_BUCKET_NAME="${S3_BUCKET_NAME}"
                            export DB_NAME="appdb"
                            export DB_USER="appadmin"
                            export DB_PORT="5432"
                            export ALLOWED_HOSTS="${EC2_HOST}"
                            export CORS_ALLOWED_ORIGINS="http://${EC2_HOST}"

                            cd ${DEPLOY_PATH}
                            python3 -m venv .venv
                            . .venv/bin/activate
                            pip install --quiet -r requirements.txt
                            python manage.py migrate --noinput
                            python manage.py loaddata products/fixtures/categories.json || true
                            python manage.py loaddata products/fixtures/products.json || true
                            python manage.py collectstatic --noinput

                            sudo systemctl restart gunicorn
EOF
                    '''
                }
            }
        }

    }

    post {
        success {
            echo "Pipeline completed successfully. App is live."
        }
        failure {
            echo "Pipeline failed. Check the logs above."
        }
        always {
            cleanWs()
        }
    }
}
