function ContactForm() {
  return (
    <section className="py-16">
      <p className="text-2xl text-center mb-8">CONTACT FORM COMPONENT</p>
      <form className="max-w-xl mx-auto space-y-4">
        <input
          type="text"
          placeholder="YOUR NAME"
          className="w-full border rounded-lg p-3"
        />
        <input
          type="email"
          placeholder="YOUR EMAIL"
          className="w-full border rounded-lg p-3"
        />
        <textarea
          placeholder="YOUR MESSAGE"
          rows={5}
          className="w-full border rounded-lg p-3"
        ></textarea>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          SEND MESSAGE
        </button>
      </form>
    </section>
  );
}

export default ContactForm;
