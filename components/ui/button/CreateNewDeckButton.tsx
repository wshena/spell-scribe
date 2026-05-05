'use client'
import { PlusIcon } from '@/components/icons/Icons'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import CreateNewDeckModal from '../modal/CreateNewDeckModal';

const CreateNewDeckButton = () => {
  const openModal = useUtilityStore((state) => state.openModal);

  const handleClick = () => {
    openModal(
      <CreateNewDeckModal />
    )
  }
  
  return (
    <button className="flex items-center gap-2 text-violet-500 cursor-pointer" onClick={handleClick}>
      <PlusIcon size={15} style='text-violet-500' />
      <span className="text-sm font-medium">New Deck</span>
    </button>
  )
}

export default CreateNewDeckButton