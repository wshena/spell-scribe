import CreateItemButton from '../button/CreateItemButton'
import { createItems } from '@/lib/constants'
import CreateModalContent from '../modal/CreateModalContent'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

const NavCreateButtonDropdown = ({ onClose }: { onClose: () => void }) => {
  const openModal = useUtilityStore((state) => state.openModal)

  const openCreateModal = (item: (typeof createItems)[number]) => {
    onClose()
    openModal(
      <CreateModalContent title={item.name} description={item.description} />,
      {
        contentClassName: "w-full",
      }
    )
  }

  return (
    <div className="absolute right-0 top-[calc(100%+0.75rem)] w-80 rounded-xl border border-white/10 bg-[#161b24] p-2 shadow-2xl shadow-black/40">
      <div className="px-3 pb-2 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          Create
        </p>
      </div>
      <div className="space-y-1">
        {createItems.map((item) => (
          <CreateItemButton key={item.name} onClick={() => openCreateModal(item)}>
          <span className="block text-sm font-semibold text-white">{item.name}</span>
          <span className="block text-sm leading-5 text-slate-400">{item.description}</span>
          </CreateItemButton>
      ))}
    </div>
    </div>
  )
}

export default NavCreateButtonDropdown
