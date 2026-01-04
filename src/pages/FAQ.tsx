import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How do I book a darshan?",
      answer: "Navigate to Darshan Services, select a temple with darshan enabled, choose your preferred date, time, and package type. Complete the payment to confirm your booking. Admin will verify and confirm your booking."
    },
    {
      question: "What are Bhakthi Points?",
      answer: "Bhakthi Points are rewards you earn by visiting temples and uploading photos. You can redeem these points for discounts on products and darshan bookings."
    },
    {
      question: "How do I track my order?",
      answer: "You can track your order status in your User Dashboard. You will also receive email notifications when your order status changes."
    },
    {
      question: "Can I cancel my darshan booking?",
      answer: "Darshan bookings can be cancelled before they are confirmed by admin. Once confirmed, cancellation depends on temple policies. Please contact support for assistance."
    },
    {
      question: "How do mantra downloads work?",
      answer: "When viewing a mantra, click the download button to save the audio file to your device. You can listen to it offline anytime."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept UPI payments, credit/debit cards, net banking, and popular wallets. All payments are secure and encrypted."
    },
    {
      question: "How do I contribute a temple to the platform?",
      answer: "Click on 'Contribute Temple' option on the homepage. Fill in the temple details, upload photos, and submit. Our team will verify and add the temple to the platform."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without consent."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-primary mb-8">Frequently Asked Questions</h1>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
