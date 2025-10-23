type FeatureCardProps = {
  title: string
  description: string
}

const FeatureCard = ({ title, description }: FeatureCardProps) => {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-slate-300">{description}</p>
    </article>
  )
}

export default FeatureCard
