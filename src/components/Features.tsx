const features = [
  { title: 'WEB3', desc: 'Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development.' },
  { title: 'AND', desc: 'Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development.' },
  { title: 'BEYOND', desc: 'Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development.' },
];

function Features() {
  return (
    <section className="py-16 max-w-6xl mx-auto">
      <p className="text-2xl text-center mb-10">FEATURES COMPONENT</p>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white shadow rounded-2xl p-6 text-center hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
