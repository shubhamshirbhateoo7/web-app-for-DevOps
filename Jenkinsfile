pipeline {
    agent any

    environment {
        AWS_REGION            = 'us-east-1'
        PROJECT_NAME          = 'scalable-webapp'
        ASG_NAME              = 'scalable-webapp-asg'
        S3_FRONTEND_BUCKET    = 'scalable-webapp-static-assets-724669215795'
        DEPLOY_PATH           = '/opt/webapp/backend'
        EC2_USER              = 'ec2-user'
    }

    stages {

        // ── 1. Checkout ───────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT}"
            }
        }

        // ── 2. Backend — install dependencies & run tests ─────────────────────
        stage('Backend: Test') {
            steps {
                dir('backend') {
                    sh '''
                        python3 -m venv .venv
                        . .venv/bin/activate
                        pip install --quiet --upgrade pip setuptools wheel
                        pip install --quiet -r requirements.txt
                        DB_PASSWORD=ci-only \
                        SECRET_KEY=ci-only-secret-key \
                        DEBUG=True \
                        python manage.py test --verbosity=2
                    '''
                }
            }
        }

        // ── 3. Frontend — install, test, build ───────────────────────────────
        stage('Frontend: Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'ALB_DNS_NAME', variable: 'ALB_DNS_NAME')
                ]) {
                    dir('frontend') {
                        sh '''
                            npm ci 
                            npm test
                            VITE_API_BASE_URL=http://${ALB_DNS_NAME} npm run build
                        '''
                    }
                }
            }
        }

        // ── 4. Deploy Frontend → S3 static-assets bucket ─────────────────────
        stage('Deploy: Frontend → S3') {
            when { branch 'main' }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials'
                ]]) {
                    dir('frontend') {
                        sh '''
                            # Upload hashed assets with long cache
                            aws s3 sync dist/ s3://${S3_FRONTEND_BUCKET}/ \
                                --region ${AWS_REGION} \
                                --delete \
                                --cache-control "max-age=31536000,immutable" \
                                --exclude "index.html"

                            # Upload index.html with no-cache
                            aws s3 cp dist/index.html \
                                s3://${S3_FRONTEND_BUCKET}/index.html \
                                --region ${AWS_REGION} \
                                --cache-control "no-cache, no-store, must-revalidate"

                            echo "Frontend deployed to s3://${S3_FRONTEND_BUCKET}"
                        '''
                    }
                }
            }
        }

        // ── 5. Deploy Backend → EC2 via SSM ──────────────────────────────────
        stage('Deploy: Backend → EC2 via SSM') {
            when { branch 'main' }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials'
                ]]) {
                    sh """
                        # Get instance IDs from the ASG
                        INSTANCE_IDS=\$(aws autoscaling describe-auto-scaling-groups \
                            --auto-scaling-group-names ${env.ASG_NAME} \
                            --region ${env.AWS_REGION} \
                            --query "AutoScalingGroups[0].Instances[?LifecycleState=='InService'].InstanceId" \
                            --output text)

                        if [ -z "\$INSTANCE_IDS" ]; then
                            echo "No healthy instances found in ASG ${env.ASG_NAME}"
                            exit 1
                        fi

                        echo "Deploying to instances: \$INSTANCE_IDS"

                        # Archive and upload backend code once
                        zip -r /tmp/backend.zip backend/ -x "backend/.venv/*" "backend/__pycache__/*"

                        aws s3 cp /tmp/backend.zip \
                            s3://${env.S3_FRONTEND_BUCKET}/deploy/backend.zip \
                            --region ${env.AWS_REGION}

                        for INSTANCE_ID in \$INSTANCE_IDS; do
                            echo "--- Deploying to \$INSTANCE_ID ---"

                            COMMAND_ID=\$(aws ssm send-command \
                                --instance-ids "\$INSTANCE_ID" \
                                --document-name "AWS-RunShellScript" \
                                --region ${env.AWS_REGION} \
                                --parameters '{"commands":[
                                    "set -e",
                                    "aws s3 cp s3://${env.S3_FRONTEND_BUCKET}/deploy/backend.zip /tmp/backend.zip --region ${env.AWS_REGION}",
                                    "unzip -o /tmp/backend.zip -d /tmp/",
                                    "rsync -a --delete /tmp/backend/ ${env.DEPLOY_PATH}/",
                                    "chown -R webapp:webapp ${env.DEPLOY_PATH}",
                                    "cd ${env.DEPLOY_PATH}",
                                    "python3 -m venv .venv",
                                    ". .venv/bin/activate && pip install --quiet -r requirements.txt",
                                    ". .venv/bin/activate && python manage.py migrate --noinput",
                                    ". .venv/bin/activate && python manage.py loaddata products/fixtures/categories.json || true",
                                    ". .venv/bin/activate && python manage.py loaddata products/fixtures/products.json || true",
                                    ". .venv/bin/activate && python manage.py collectstatic --noinput",
                                    "systemctl restart gunicorn",
                                    "echo Deploy complete on \$(hostname)"
                                ]}' \
                                --query "Command.CommandId" \
                                --output text)

                            echo "SSM Command ID: \$COMMAND_ID"

                            # Wait for execution
                            aws ssm wait command-executed \
                                --command-id "\$COMMAND_ID" \
                                --instance-id "\$INSTANCE_ID" \
                                --region ${env.AWS_REGION}

                            # Check status
                            STATUS=\$(aws ssm get-command-invocation \
                                --command-id "\$COMMAND_ID" \
                                --instance-id "\$INSTANCE_ID" \
                                --region ${env.AWS_REGION} \
                                --query "Status" --output text)

                            echo "Deploy status on \$INSTANCE_ID: \$STATUS"

                            if [ "\$STATUS" != "Success" ]; then
                                echo "Deploy failed on \$INSTANCE_ID"
                                aws ssm get-command-invocation \
                                    --command-id "\$COMMAND_ID" \
                                    --instance-id "\$INSTANCE_ID" \
                                    --region ${env.AWS_REGION} \
                                    --query "StandardErrorContent" \
                                    --output text
                                exit 1
                            fi
                        done

                        echo "Backend deployed to all instances in ${env.ASG_NAME}"
                    """
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
