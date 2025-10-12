"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/NewAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";

const NewProductPage = () => {
  const { state: authState } = useAuth();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "admin") {
      router.push("/");
    }
  }, [authState, router]);

  if (!authState.isAuthenticated || authState.user?.role !== "admin") {
    return null;
  }

  return (
    <AdminLayout>
      <ProductForm mode="create" />
    </AdminLayout>
  );
};

export default NewProductPage;
