import Button from '../components/Button';
import ContactForm from '../components/ContactForm';
import Features from '../components/Features';

function Resources() {
  return (
    <div className="flex flex-col items-center mt-[75px]">
      <p className="mb-[10px]">BUTTON COMPONENT</p>
      <Button>BUTTON</Button>
      <ContactForm />
      <Features />
    </div>
  );
}

export default Resources;
