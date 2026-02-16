import ProfileLayout from "./ProfileLayout";
import FormContainer from "@/components/FormContainer";

/* ================= TYPES ================= */

type Teacher = {
  id: string;
  name: string;
  surname: string;
  phone?: string | null;
  img?: string | null;
  lastActiveAt?: Date | null;
};

type TeacherProfileProps = {
  teacher: Teacher;
};

/* ================= COMPONENT ================= */

export default function TeacherProfile({ teacher }: TeacherProfileProps) {
  const fullName = `${teacher.name} ${teacher.surname}`;
  const initials = `${teacher.name[0] ?? ""}${teacher.surname[0] ?? ""}`.toUpperCase();

  return (
    <ProfileLayout
      userId={teacher.id}
      img={teacher.img ?? null}
      initials={initials}
      name={fullName}
      roleLabel="Teacher"
      lastActiveAt={teacher.lastActiveAt ?? null}
    >
      <Section title="Account Information" editable>
        <Info label="Role" value="Teacher" />
        <Info label="Name" value={fullName} />
        <Info label="Phone" value={teacher.phone ?? "-"} />
        <Info label="User ID" value={teacher.id} mono />
      </Section>
    </ProfileLayout>
  );
}

/* ================= HELPERS ================= */

type SectionProps = {
  title: string;
  editable?: boolean;
  children: React.ReactNode;
};

function Section({ title, editable = false, children }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl border p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{title}</h2>

        {editable && (
          <FormContainer
            table="profile"
            type="update"
            trigger={
              <button className="text-sm text-blue-600 hover:underline">
                Edit
              </button>
            }
          />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

type InfoProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function Info({ label, value, mono = false }: InfoProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`font-medium ${mono ? "font-mono text-sm" : ""}`}>
        {value}
      </p>
    </div>
  );
}
