export const ApiEndpoints = {
  auth: {
    me: '/auth/me',
    login: '/auth/login',
    logout: '/auth/logout',
    twoFactorComplete: '/auth/2fa/complete-login',
  },
  tether: {
    initiate: '/api/tether/initiate',
    accept: '/api/tether/accept',
    reject: '/api/tether/reject',
    disconnect: '/api/tether/disconnect',
    status: '/api/tether/status',
    uploadPhoto: '/api/tether/upload-photo',
    pendingPhotos: '/api/tether/pending-photos',
    activeDevices: '/api/tether/active-devices',
    findMyPhone: '/api/tether/find-my-phone',
  },
  smartScan: {
    process: '/api/smart-scan/process',
    addToGarage: '/api/smart-scan/add-to-garage',
    createSuggestion: '/api/smart-scan/create-suggestion',
    quickCrop: '/api/smart-scan/quick-crop',
    addNewCarToGarage: '/api/smart-scan/add-new-car-to-garage',
  },
};
