import React from 'react'

const ContentContainer = ({children}:{children:React.ReactNode}) => {
  return (
    <div className='max-w-360 mx-auto py-7 px-5 md:px-10 xl:px-20'>{children}</div>
  )
}

export default ContentContainer