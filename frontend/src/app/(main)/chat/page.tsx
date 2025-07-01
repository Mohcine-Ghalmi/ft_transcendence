'use server'
import LeftSide from './components/LeftSide'
import Chat from './components/Chat'
import 'react-loading-skeleton/dist/skeleton.css'

const page = () => {
  return (
    <div className="flex h-[92vh] gap-6 p-6">
      <LeftSide />
      <Chat />
    </div>
  )
}

export default page
