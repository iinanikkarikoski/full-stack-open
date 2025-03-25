import { useState } from 'react'

const Header = ({text}) => {
  return <h1>{text}</h1>
}

const StatisticLine = ({text, value}) => (
  //HTML muotoilu riville
  <tr>
    <td>{text}</td>
    <td>{value}</td>
  </tr>
)

const Statistics = ({good, neutral, bad}) => {
  const total = good + neutral + bad
  const average = total === 0 ? 0 : (good - bad) / total
  const positive = total === 0 ? 0 : (good / total) * 100

  if (total === 0) {
    return <p>No feedback given</p>
  }

  return(
    //HTML taulukko
    <table>
      <tbody>
        <StatisticLine text="Good" value ={good} />
        <StatisticLine text="Neutral" value ={neutral} />
        <StatisticLine text="Bad" value ={bad} />
        <StatisticLine text="All" value ={total} />
        <StatisticLine text="Average" value ={average.toFixed(1)} />
        <StatisticLine text="Positive" value ={positive.toFixed(1) + ' %'} />
      </tbody>
    </table>
  )
}

const App = () => {
  const feedback = 'Give Feedback'
  const statistic = 'Statistics'

  // tallenna napit omaan tilaansa
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <Header text={feedback}/>
      <div>
        <button onClick={() => setGood(good + 1)}> good </button>
        <button onClick={() => setNeutral(neutral + 1)}> neutral </button>
        <button onClick={() => setBad(bad + 1)}> bad </button>
      </div>
      <Header text={statistic} />
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App
