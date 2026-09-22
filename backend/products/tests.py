from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Category, Product


class CategoryModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Electronics", slug="electronics")

    def test_category_str(self):
        self.assertEqual(str(self.category), "Electronics")


class ProductModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Electronics", slug="electronics")
        self.product = Product.objects.create(
            name="Laptop", slug="laptop", description="A laptop",
            price=999.99, stock=10, category=self.category
        )

    def test_product_str(self):
        self.assertEqual(str(self.product), "Laptop")


class ProductAPITest(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Electronics", slug="electronics")
        Product.objects.create(
            name="Laptop", slug="laptop", description="A laptop",
            price=999.99, stock=10, category=self.category, is_available=True
        )
        Product.objects.create(
            name="Phone", slug="phone", description="A phone",
            price=499.99, stock=5, category=self.category, is_available=True
        )

    def test_health_check(self):
        response = self.client.get(reverse("health-check"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")

    def test_list_products(self):
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_product_detail(self):
        response = self.client.get(reverse("product-detail", kwargs={"slug": "laptop"}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Laptop")

    def test_search_products(self):
        response = self.client.get(reverse("product-list"), {"search": "laptop"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_filter_by_category(self):
        response = self.client.get(reverse("product-list"), {"category": "electronics"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
