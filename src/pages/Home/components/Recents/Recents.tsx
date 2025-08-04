import Assets from '@/utils/Assets'
import React from 'react'

function Recents() {
    return (
        <div style={{ padding: 24 }} className='bg-neutral-100 w-full rounded-2xl '>
            <p className='font-poppins text-md font-medium text-neutral-900'>
                Recents
            </p>
            <div className='flex flex-row justify-between items-center w-full'>

        
                <div style={{ padding: 24, marginTop: 24 }} className='flex flex-col  bg-radial from-[#2E3166] to-[#202242] to-75% w-[49%] rounded-2xl'>
                    <div style={{padding:12}} className='bg-[#EBF7FF33]  rounded-4xl flex flex-row gap-2 items-center '>
                        <img className='size-2' src={Assets.icons.advanceDot} />
                        <p className='text-sky-400'>Advance Event</p>

                    </div>
                
                    <div className='flex' style={{marginTop:40}} >
                        <p className='text-neutral-100'>
                            Event Name here
                        </p>

                    </div>
                
      
                </div>
                

              <div style={{ padding: 24, marginTop: 24 }} className='flex items-center bg-radial from-[#2E3166] to-[#202242] to-75%  w-[49%] rounded-2xl'>
                
      
    </div>
            </div>
      </div>
  )
}

export default Recents
