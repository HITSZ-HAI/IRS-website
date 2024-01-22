import {useState} from 'react'
import {useToastContext} from '@github-ui/toast'
import {createRequest, deleteRequest} from '../services/api'

export interface FeatureRequestState {
  inProgress: boolean
  requested: boolean
  toggleFeatureRequest: () => void
}

export interface FeatureRequestInfo {
  alreadyRequested: boolean
  featureName: string
  requestPath: string
}

export function useFeatureRequest(featureRequestInfo?: FeatureRequestInfo): FeatureRequestState {
  const {alreadyRequested = false, featureName = '', requestPath = ''} = featureRequestInfo ?? {}
  const [inProgress, setInProgress] = useState(false)
  const [requested, setRequested] = useState(alreadyRequested)
  const {addToast} = useToastContext()

  const toggleFeatureRequest = async () => {
    setInProgress(true)
    const request = requested ? deleteRequest : createRequest
    const success = await request(requestPath, featureName)
    if (success) {
      setRequested(!requested)
    } else {
      addToast({type: 'error', message: 'Something went wrong. Please try again later.'})
    }
    setInProgress(false)
  }

  return {
    inProgress,
    requested,
    toggleFeatureRequest,
  }
}
