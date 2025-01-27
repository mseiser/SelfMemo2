import { FC } from "react";

interface IStat {
  name: string;
  value: string;
}

interface IDashboardCardProps {
  stats: IStat[];
}

const DashboardCard: FC<IDashboardCardProps> = ({ stats }) => {
  return (
    <div >
      <dl className="grid grid-cols-1 gap-1 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="flex flex-col bg-gray-400/5 p-8">
            <dt className="text-sm/6 font-semibold text-gray-600">{stat.name}</dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default DashboardCard;