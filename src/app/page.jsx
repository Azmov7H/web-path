

export async function getusers ()=>{
  const res =await fetch("http://localhost:3000/api/users/")
  const date =await  res.json()
  console.log(data)
  return date
}
export default async function page() {
  const users = await getusers();
  return (
    <div>
      
      <h1>Page Users </h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
