import Button from './Button';

function Welcome() {
  return (
    <section className="bg-green-50 py-20">
      <div className="container mx-auto text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-700">
          WELCOME TO THE WEB3 HACKATHON!
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Build projects that push the boundaries of the web.
        </p>
        <div className="mt-6">
          <Button>Get Started!</Button>
        </div>
      </div>
    </section>
  );
}

export default Welcome;
