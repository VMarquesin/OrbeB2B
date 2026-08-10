export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6">
      <div className="shrink-0">
        <div className="rounded-xl bg-primary-light p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
    </div>
  );
}
