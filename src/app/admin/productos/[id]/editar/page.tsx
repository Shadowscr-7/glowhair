"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/NewAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";
import { Loader2 } from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  categoryId: string;
  benefits: string[];
  usage: string;
  ingredients: string;
  inStock: boolean;
}

const EditProductPage = () => {
  const { state: authState } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [initialImage, setInitialImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "admin") {
      router.push("/");
    }
  }, [authState, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setInitialData({
            name: data.name || "",
            description: data.description || "",
            price: data.price || 0,
            originalPrice: data.original_price || 0,
            category: typeof data.category === "string" ? data.category : data.category?.name || "",
            categoryId: typeof data.category === "string" ? "" : data.category?.id || "",
            benefits: data.benefits && data.benefits.length > 0 ? data.benefits : [""],
            usage: data.usage_instructions || "",
            ingredients: data.ingredients ? 
              (Array.isArray(data.ingredients) ? data.ingredients.join(", ") : data.ingredients) : "",
            inStock: data.in_stock ?? data.inStock ?? true
          });
          if (data.images && data.images.length > 0) {
            setInitialImage(data.images[0]);
          }
        } else {
          router.push("/admin/productos");
        }
      } catch {
        router.push("/admin/productos");
      } finally {
        setIsLoading(false);
      }
    };

    if (authState.isAuthenticated && authState.user?.role === "admin" && productId) {
      fetchProduct();
    }
  }, [authState, router, productId]);

  if (!authState.isAuthenticated || authState.user?.role !== "admin") {
    return null;
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-glow-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!initialData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Producto no encontrado</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ProductForm 
        mode="edit" 
        productId={productId}
        initialData={initialData}
        initialImage={initialImage}
      />
    </AdminLayout>
  );
};

export default EditProductPage;
