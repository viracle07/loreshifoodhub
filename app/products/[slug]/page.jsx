import Link from "next/link";
import { notFound } from "next/navigation";

import {
    getProductBySlug,
    getRelatedProducts,
} from "@/lib/products/product-service";

import ProductDetails from "@/components/products/ProductDetails";
import RelatedProducts from "@/components/products/RelatedProducts";

export default async function ProductPage({ params }) {
    const { slug } = await params;

    const product = await getProductBySlug(slug);

    if (!product || product.active === false) {
        notFound();
    }

    const relatedProducts =
        await getRelatedProducts(
            product.categoryId,
            product.id,
            4
        );

    if (!product || product.active === false) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#FFFDF8]">
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">
                <Link
                    href="/products"
                    className="inline-flex items-center text-sm font-semibold text-[#68912B] transition hover:text-[#B22625]"
                >
                    ← Back to products
                </Link>

                <div className="mt-6">
                    <ProductDetails product={product} />

                    <RelatedProducts
                        products={relatedProducts}
                    />
                </div>
            </div>
        </main>
    );
}