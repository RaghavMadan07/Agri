import { ExclamationTriangleIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { DamageAlert } from '@/lib/types'
import { format } from 'date-fns'

interface AlertCardProps {
  alert: DamageAlert
  onView?: () => void
}

const severityColors = {
  low: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  medium: 'bg-orange-50 border-orange-200 text-orange-800',
  high: 'bg-red-50 border-red-200 text-red-800',
  critical: 'bg-red-100 border-red-400 text-red-900',
}

const severityBadges = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-200 text-red-900',
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  reviewing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function AlertCard({ alert, onView }: AlertCardProps) {
  return (
    <div className={`border-l-4 rounded-lg p-4 ${severityColors[alert.severity]} card-hover`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={alert.severity === 'critical' ? 'alert-pulse' : ''}>
            <ExclamationTriangleIcon className="h-6 w-6 text-current" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold capitalize">
                {alert.damageType.replace(/_/g, ' ')}
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severityBadges[alert.severity]}`}>
                {alert.severity}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[alert.status]}`}>
                {alert.status}
              </span>
            </div>
            
            <p className="text-xs text-gray-700 mb-2">
              Affected Area: <span className="font-semibold">{alert.affectedArea} hectares</span>
            </p>

            {alert.cropImage && (
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <MapPinIcon className="h-3 w-3" />
                <span>
                  {alert.cropImage.location.village}, {alert.cropImage.location.district}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <ClockIcon className="h-3 w-3" />
              <span>Reported {format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>

            {alert.claimAmount && (
              <p className="text-xs font-medium text-gray-900 mt-2">
                Claim Amount: ₹{alert.claimAmount.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {onView && (
          <button
            onClick={onView}
            className="ml-4 px-3 py-1.5 text-xs font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  )
}

