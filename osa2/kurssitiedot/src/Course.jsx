const Part = ({part}) => {
    return <p>{part.name} {part.exercises}</p>
}
  
const Content = ({parts}) => {
    return (
      <div>
        {parts.map(part => (
          <Part key={part.id} part={part} />
        ))}
      </div>
    )
}
  
const Total = ({parts}) => {
    const total = parts.reduce((sum, part) => sum + part.exercises, 0)
    return <p><b>Total of {total} exercises</b></p>
}
  
const Course = ({course}) => (
    <div>
      <h2>{course.name}</h2>
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
)

export default Course
