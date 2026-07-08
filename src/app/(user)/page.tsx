import ProductCard from "@/components/ui/ProductCard";

export default function Home() {
  const featuredProducts = [
    { id: "1", name: "Matte Black Watch", price: 120.00, imageUrl: "", category: "Accessories" },
    { id: "2", name: "Ceramic Pour-over", price: 45.00, imageUrl: "", category: "Kitchen" },
    { id: "3", name: "Leather Tote", price: 189.00, imageUrl: "", category: "Bags" },
    { id: "4", name: "Architect Lamp", price: 75.00, imageUrl: "", category: "Workspace" },
    { id: "5", name: "Linen Journal", price: 24.00, imageUrl: "", category: "Stationery" },
    { id: "6", name: "Wireless Earbuds", price: 150.00, imageUrl: "", category: "Tech" },
    { id: "7", name: "Concrete Planter", price: 32.00, imageUrl: "", category: "Home" },
    { id: "8", name: "Steel Water Bottle", price: 28.00, imageUrl: "", category: "Essentials" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:Flpx-6 lg:px-8 py-24">
      
      <div className="mb-24 flex flex-col items-center text-center">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
          Curated for clarity.
        </h1>
        <p className="max-w-2xl text-lg text-slate-500">
          A collection of intentionally designed essentials to elevate your everyday environment. Minimalist form, maximum function.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
        {featuredProducts.map((product) => (
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
  );
}