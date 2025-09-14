interface ExampleProps {
  title: string
  description?: string
}

export default function Example({ title, description }: ExampleProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {description && (
        <p className="text-gray-600">{description}</p>
      )}
    </div>
  )
}