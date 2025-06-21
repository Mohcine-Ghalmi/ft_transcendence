'use server'
import LeftSide from './components/LeftSide'
import Chat from './components/Chat'
import RightSide from './components/RightSide'
import 'react-loading-skeleton/dist/skeleton.css'

const page = () => {
  return (
    <div className="flex h-[93vh] mt-10 gap-6 p-6">
      <LeftSide />
      <Chat />
    </div>
  )
}

export default page
