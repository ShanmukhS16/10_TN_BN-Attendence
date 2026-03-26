import { Shield, Code2, GraduationCap, Award, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type Contributor = {
  name: string;
  role: string;
  subtitle?: string;
  description: string[];
  image: string;
  icon: ReactNode;
};

const leadership: Contributor = {
  name: "Lt. Col. V. Venkatesh",
  role: "Concept & Initialization",
  subtitle: "Leadership",
  image: "/team/venkatesh_sir.jpg",
  icon: <Shield className="h-5 w-5" />,
  description: [
    "Lt. Col. V. Venkatesh conceptualized and initiated the development of this attendance management system with the objective of improving efficiency, accountability, and scalability in attendance administration across NCC units. His guidance laid the foundation for a system designed to simplify record maintenance, strengthen reporting accuracy, and support smoother day-to-day operational workflows.",
    "With a distinguished background in the Indian Armed Forces, including service in elite formations such as 9 Para (Special Forces), he brings a strong sense of discipline, leadership, and operational insight to this initiative. His vision helped shape the platform not merely as a technical solution, but as a practical administrative tool aligned with the structured requirements of NCC functioning.",
    "Beyond his professional accomplishments, he is also known for his appreciation for animal welfare, reflecting a compassionate and balanced leadership approach. His leadership, foresight, and encouragement played a vital role in transforming the idea of this platform into a meaningful and usable system for wider institutional application.",
  ],
};

const developers: Contributor[] = [
  {
    name: "Cpl. Seeram Shanmukh Srinivas",
    role: "Lead Developer & System Architect",
    subtitle: "Vellore Institute of Technology, Vellore",
    image: "/team/shanmukh.jpeg",
    icon: <Code2 className="h-5 w-5" />,
    description: [
      "Cpl. Seeram Shanmukh Srinivas, a student of Vellore Institute of Technology (VIT), Vellore, led the design and development of the attendance management system, translating the initial concept into a robust, functional, and scalable digital platform. He played the central role in converting the operational requirements of the system into an application that supports efficient attendance recording, streamlined reporting, and better administrative accessibility.",
      "He was responsible for the core technical architecture of the platform, including frontend development, backend integration, database connectivity, and overall system coordination. His work focused on creating a user-friendly and responsive interface while ensuring reliability, structured data handling, and maintainable system design for long-term usability across units.",
      "In addition to his technical contributions, he has demonstrated consistent excellence in NCC activities, having been selected for the Basic Leadership Camp (BLC), Coimbatore, the Advanced Leadership Camp (ALC), Kerala, and the prestigious SSB Super 30 Camp. His combined strengths in leadership, discipline, and technical execution have been instrumental in the successful development of this system.",
    ],
  },
  {
    name: "Cpl. Akash N",
    role: "Co-Developer & Frontend Engineer",
    subtitle: "Vellore Institute of Technology, Vellore",
    image: "/team/akash.jpg",
    icon: <GraduationCap className="h-5 w-5" />,
    description: [
      "Cpl. Akash N, a student of Vellore Institute of Technology (VIT), Vellore, contributed significantly to the development of the attendance management system by supporting the implementation of key features and refining the usability of the platform. His efforts helped strengthen the system’s functionality and improve the overall experience for end users.",
      "Worked closely in collaboration on the development and refinement of core system features.He was involved in frontend development, interface enhancement, and integration support, contributing to the smooth execution of various modules within the application. His role was important in ensuring that the system remained intuitive, responsive, and aligned with the practical needs of attendance management and reporting.",
      "Through his technical support and development contributions, he played an important role in improving the quality, usability, and operational readiness of the platform. His work has helped make the system more effective as a dependable solution for attendance administration across units.",
    ],
  },
];

function ProfileCard({ person }: { person: Contributor }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-emerald-300/[0.05]" />
      <div className="relative p-6 md:p-7">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-300/20 blur-md" />
            <img
              src={person.image}
              alt={person.name}
              className="relative h-28 w-28 rounded-full object-cover border-4 border-white/20 shadow-lg"
            />
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
            {person.icon}
            <span>{person.role}</span>
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-white">
            {person.name}
          </h3>

          {person.subtitle && (
            <p className="mt-1 text-sm text-slate-300">{person.subtitle}</p>
          )}

          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-200/90">
            {person.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6 py-12 md:px-8 md:py-16 shadow-xl">
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-slate-200 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Leadership & Development
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Built with vision, discipline, and technical precision
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            This attendance management system was conceptualized and developed to
            support efficient, transparent, and scalable attendance administration
            across NCC units.
          </p>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center gap-3 text-white">
            <Award className="h-5 w-5 text-emerald-300" />
            <h3 className="text-xl font-semibold">Leadership</h3>
          </div>
          <div className="grid grid-cols-1">
            <ProfileCard person={leadership} />
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center gap-3 text-white">
            <Code2 className="h-5 w-5 text-cyan-300" />
            <h3 className="text-xl font-semibold">Development Team</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {developers.map((person) => (
              <ProfileCard key={person.name} person={person} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}