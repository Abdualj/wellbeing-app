import { useState } from 'react'
import ShareModal from '../components/Community/ShareModal'
import { useApp } from '../context/AppContext'

const Community = () => {
  const [showShare, setShowShare] = useState(false)
  const [activeTab, setActiveTab] = useState('public')
  const { user } = useApp()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sage-900">Community Feed</h1>
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="px-6 py-2.5 bg-sage-700 text-white rounded-md hover:bg-sage-800 transition active:scale-95 font-medium whitespace-nowrap"
          >
            + Share
          </button>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('public')}
              className={`py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'public'
                  ? 'border-sage-700 text-sage-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Public Feed
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'community'
                  ? 'border-sage-700 text-sage-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Community Feed
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="text-center py-8">
            <p className="text-gray-500"></p>
          </div>
        </div>
      </div>

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} user={user} />
    </div>
  )
}

export default Community