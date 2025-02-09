import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/components/ui/accordion"
import { cn } from "@repo/ui/lib/utils"
import Link from "next/link"

const faq = [
  {
    question: "How is Dromi different from any other productivity app?",
    answer: (
      <p>Our commitment to privacy and security is at the core of our mission. We're dedicated to creating a safe and secure workspace for your tasks and ideas. Our open-source nature ensures that you have full control over your data and can make changes as needed. We believe that privacy and security are essential for a productive and fulfilling work experience.</p>
    )
  },
  {
    question: "Can I access my data from other devices?",
    answer: (
      <p>Yes, you can access your data from other devices by logging in to your Dromi account on any device.</p>
    )
  },
  {
    question: "What should I do if I encounter an issue with Dromi?",
    answer: (
      <p>Issues are expected, as we're currently in our alpha stage. If you encounter any issues, please create an issue on our <Link href="https://github.com/dromiapp/dromi" className="text-dromi-primary hover:underline">GitHub repository</Link>, or reach out to a team member via our <Link href="https://discord.gg/krgsVNEQRJ" className="text-dromi-primary hover:underline">Discord</Link>.</p>
    )
  },
  {
    question: "How can I contribute to Dromi?",
    answer: (
      <p>We're always looking for contributors to help us improve Dromi. If you're interested in contributing, please check out our <Link href="https://github.com/dromiapp/dromi" className="text-dromi-primary hover:underline">GitHub repository</Link> for a more comprehensive guide on how to get started.</p>
    )
  }
]

export default function FAQ() {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-7 text-center",
      "w-full max-w-[700px] mx-auto",
      "md:px-0 px-5"
    )}>
      <h2 className="text-4xl font-bold">You've got questions &mdash;<br /> and we've got answers.</h2>
      <p className="text-center text-lg text-secondary-foreground/80 font-semibold">
        We're here to help you get the most out of Dromi. Whether you're a seasoned user or just starting out, we've got the answers you need to make the most of our platform.
      </p>

      <Accordion type="single" collapsible className="w-full">
        {faq.map((item, index) => (
          <AccordionItem key={`faq-${item.question}`} value={item.question}>
            <AccordionTrigger className="font-bold">{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}