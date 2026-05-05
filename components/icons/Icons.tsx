import { FaSearch, FaFilter, FaBell, FaPlus, FaBox, FaAngleRight } from "react-icons/fa";
import { IoCreateSharp, IoBagAdd } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { CiMenuFries } from "react-icons/ci";
import { MdCancel, MdOutlineFlipCameraAndroid } from "react-icons/md";
import { BsStack } from "react-icons/bs";
import { TbCardsFilled } from "react-icons/tb";
import { SlOptionsVertical } from "react-icons/sl";

interface Icons {
  style?:string
  size: number
  color?: string
}

export const OptionsIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <SlOptionsVertical className={style} size={size} color={color} />;
}

export const BagAddIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <IoBagAdd className={style} size={size} color={color} />;
}

export const FlipIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <MdOutlineFlipCameraAndroid className={style} size={size} color={color} />;
}

export const AngleRightIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <FaAngleRight className={style} size={size} color={color} />;
}

export const BoxIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <FaBox className={style} size={size} color={color} />;
}

export const CardsIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <TbCardsFilled className={style} size={size} color={color} />;
}

export const StackIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <BsStack className={style} size={size} color={color} />;
}

export const PlusIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <FaPlus className={style} size={size} color={color} />;
}

export const BellIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <FaBell className={style} size={size} color={color} />;
}

export const SearchIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <FaSearch className={style} size={size} color={color} />;
}

export const CreateIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <IoCreateSharp className={style} size={size} color={color} />;
}

export const ProfileIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <CgProfile className={style} size={size} color={color} />;
}

export const MenuIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <CiMenuFries className={style} size={size} color={color} />;
}

export const CancelIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <MdCancel className={style} size={size} color={color} />;
}

export const FilterIcon: React.FC<Icons> = ({ style, size, color }) => {
  return <FaFilter className={style} size={size} color={color} />;
}