import Assets from '@/utils/Assets'
import React from 'react'

function Recents() {
  const recentEvents = [
    {
      id: 1,
      type: 'Advance Event',
      name: 'Event Name here',
      date: 'Aug 10, 2025',
    },
    {
      id: 2,
      type: 'Express Event',
      name: 'Second Event',
      date: 'Sep 15, 2025',
    },
  ]

  const getEventStyle = (type) => {
    switch (type) {
      case 'Advance Event':
        return {
          icon: Assets.icons.advanceDot,
          color: '#38BDF8', // sky-400
        }
      case 'Express Event':
        return {
          icon: Assets.icons.expressDot,
          color: '#10B981', // emerald-500
        }
      default:
        return {
          icon: Assets.icons.defaultDot || '', // fallback icon
          color: '#6B7280', // neutral-500
        }
    }
  }

  return (
    <div className='bg-white w-full rounded-2xl p-6'>
      <p className='font-poppins text-md font-medium text-neutral-900 mb-4'>Recents</p>

      <div className='flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-4'>
        {recentEvents.map((event) => {
          const { icon, color } = getEventStyle(event.type)

          return (
            <div
              key={event.id}
              className='flex flex-col w-full sm:w-[48%] bg-gradient-to-br from-[#2E3166] to-[#202242] rounded-2xl p-6'
            >
              <div className='flex'>
                <div
                  className='flex items-center gap-2 px-3 py-2 rounded-2xl'
                  style={{
                    backgroundColor: '#EBF7FF33',
                    width: 'auto',
                  }}
                >
                  <img style={{ width: 8, height: 8 }} src={icon} alt="dot" />
                  <p
                    style={{
                      color: color,
                      fontSize: 12,
                      fontFamily: 'Poppins',
                      fontWeight: '400',
                      margin: 0,
                    }}
                  >
                    {event.type}
                  </p>
                </div>
              </div>

              <div className='flex flex-col gap-2 mt-10'>
                <p className='text-neutral-100 font-poppins font-medium text-md'>
                  {event.name}
                </p>
                <p className='text-neutral-300 font-poppins font-normal text-xs'>
                  {event.date}
                </p>
              </div>
            </div>
          )
        })}
          </div>
           {recentEvents.length === 0 && (
  <div className="w-full flex justify-center items-center py-10">
    <img className="h-40 w-40" src={Assets.images.eventEmptyCard} alt="No Events" />
  </div>
)}
    </div>
  )
}

export default Recents
