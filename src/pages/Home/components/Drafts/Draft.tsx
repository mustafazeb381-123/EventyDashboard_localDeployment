import Assets from '@/utils/Assets'
import React from 'react'

function Draft() {
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

  const getEventStyle = (type: any) => {
    switch (type) {
      case 'Advance Event':
        return {
          icon: Assets.icons.advanceDot,
          color: '#38BDF8',
          bg: 'bg-sky-50',
          backgroundImage: `url(${Assets.images.whiteBackSetting})`,
        }
      case 'Express Event':
        return {
          icon: Assets.icons.expressDot,
          color: '#10B981',
          bg: 'bg-emerald-50',
          backgroundImage: `url(${Assets.images.whiteBackStar})`,
        }
      default:
        return {
          icon: Assets.icons.defaultDot || '',
          color: '#6B7280',
          bg: 'bg-neutral-100',
          backgroundImage: 'none',
        }
    }
  }

  return (
    <div className='bg-white w-full rounded-2xl p-6'>
      <p className='font-poppins text-md font-medium text-neutral-900 mb-4'>Draft</p>

      <div className='flex flex-col md:flex-row md:flex-wrap md:justify-between gap-4'>
        {recentEvents.map((event) => {
          const { icon, color, bg, backgroundImage } = getEventStyle(event.type)

          return (
            <div
              key={event.id}
              style={{
                backgroundImage: backgroundImage,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right center',
                backgroundSize: 'auto 100%',
              }}
              className='flex flex-col rounded-2xl bg-neutral-100 w-full md:w-[48%] p-6'
            >
              <div className='flex'>
                <div
                  className={`${bg} rounded-2xl flex flex-row items-center gap-2 px-3 py-2`}
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
                <p className='text-slate-800 font-poppins font-medium text-md'>
                  {event.name}
                </p>
                <p className='text-neutral-500 font-poppins font-normal text-xs'>
                  {event.date}
                </p>
              </div>
            </div>
          )
        })}
           {recentEvents.length === 0 && (
  <div className="w-full flex justify-center items-center py-10">
    <img className="h-40 w-40" src={Assets.images.eventEmptyCard} alt="No Events" />
  </div>
)}
      </div>
    </div>
  )
}

export default Draft
