import Welcome from '../components/Welcome';
import Card from '../components/Card';

function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Welcome />

      <main className="flex-grow container mx-auto px-6 py-12 grid gap-6 md:grid-cols-3">
        <Card
          title="WEB3"
          description="Lorem ipsum is a dummy or placeholder text commonly used in graphic design"
          image="https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=2070&auto=format&fit=crop"
        />
        <Card
          title="AND"
          description="Lorem ipsum is a dummy or placeholder text commonly used in graphic design"
          image="https://images.unsplash.com/photo-1687436874760-45d7cf64dc22?q=80&w=2070&auto=format&fit=crop"
        />
        <Card
          title="BEYOND"
          description="Lorem ipsum is a dummy or placeholder text commonly used in graphic design"
          image="https://plus.unsplash.com/premium_photo-1742910864340-2aa39c65d1bc?q=80&w=2070&auto=format&fit=crop"
        />
      </main>
    </div>
  );
}

export default Home;
