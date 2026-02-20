import Tabs from '@/components/Tabs';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Gerir Dieta
          </h1>
          <p className="text-gray-600">
            Gerencie seus alimentos, refeições e acompanhe seus macros diários
          </p>
        </div>
        <Tabs />
      </div>
    </main>
  );
}
