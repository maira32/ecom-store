import ProductCard from "@/components/ui/ProductCard";

export default function CategoriesPage() {
  const allProducts = [
    { id: "1", name: "Matte Black Watch", price: 120.00, imageUrl: "", category: "Accessories" },
    { id: "2", name: "Ceramic Pour-over", price: 45.00, imageUrl: "", category: "Kitchen" },
    { id: "3", name: "Leather Tote", price: 189.00, imageUrl: "", category: "Bags" },
    { id: "4", name: "Architect Lamp", price: 75.00, imageUrl: "", category: "Workspace" },
  ];

  const categories = ["All", "Accessories", "Bags", "Kitchen", "Workspace", "Tech"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      
      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Categories</h2>
          <ul className="space-y-4">
            {categories.map((cat) => (
              <li key={cat}>
                <button className="text-slate-900 hover:text-slate-900 font-medium transition-colors text-sm">
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Products</h1>
            <span className="text-sm text-slate-900 font-medium">{allProducts.length} items</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {allProducts.map((product) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                category={product.category}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}