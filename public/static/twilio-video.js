// Twilio Video Integration for SecureChat & Pay
// Documentation: https://www.twilio.com/docs/video

class TwilioVideoManager {
  constructor() {
    this.room = null;
    this.localTracks = null;
    this.remoteParticipants = new Map();
    this.isVideoCall = true;
    this.isMuted = false;
    this.isVideoOff = false;
  }

  /**
   * Initialize Twilio Video Call
   * @param {string} roomCode - The room code for the call
   * @param {boolean} isVideoCall - True for video, false for audio only
   * @param {string} userName - Current user's display name
   */
  async initializeCall(roomCode, isVideoCall = true, userName = 'User') {
    this.isVideoCall = isVideoCall;
    
    try {
      // Step 1: Get Twilio access token from your backend
      const token = await this.getAccessToken(roomCode, userName);
      
      // Step 2: Create local tracks (audio + video)
      const tracks = [];
      
      if (isVideoCall) {
        const videoTrack = await Twilio.Video.createLocalVideoTrack({
          width: 640,
          height: 480,
          frameRate: 24
        });
        tracks.push(videoTrack);
      }
      
      const audioTrack = await Twilio.Video.createLocalAudioTrack();
      tracks.push(audioTrack);
      
      this.localTracks = tracks;
      
      // Step 3: Connect to the room
      this.room = await Twilio.Video.connect(token, {
        name: roomCode,
        tracks: tracks,
        audio: true,
        video: isVideoCall,
        maxAudioBitrate: 16000, // For better audio quality
        dominantSpeaker: true,
        networkQuality: {
          local: 1,
          remote: 1
        }
      });
      
      console.log(`Successfully joined room: ${this.room.name}`);
      
      // Step 4: Display local video/audio
      this.displayLocalTracks();
      
      // Step 5: Handle existing participants
      this.room.participants.forEach(participant => {
        this.participantConnected(participant);
      });
      
      // Step 6: Set up event listeners
      this.setupEventListeners();
      
      return { success: true, room: this.room };
      
    } catch (error) {
      console.error('Failed to initialize call:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Twilio Access Token from Backend
   */
  async getAccessToken(roomCode, userName) {
    try {
      // IMPORTANT: This endpoint must be implemented in your backend (src/index.tsx)
      const response = await fetch('/api/twilio/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode,
          userName: userName
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get access token');
      }
      
      const data = await response.json();
      return data.token;
      
    } catch (error) {
      console.error('Error getting Twilio token:', error);
      throw error;
    }
  }

  /**
   * Display local video/audio tracks
   */
  displayLocalTracks() {
    const localMediaContainer = document.getElementById('local-media');
    if (!localMediaContainer) return;
    
    this.localTracks.forEach(track => {
      const mediaElement = track.attach();
      mediaElement.classList.add('local-video');
      
      if (track.kind === 'video') {
        mediaElement.style.cssText = `
          width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 12px;
          border: 3px solid #10b981;
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `;
      }
      
      localMediaContainer.appendChild(mediaElement);
    });
  }

  /**
   * Handle participant connection
   */
  participantConnected(participant) {
    console.log(`Participant connected: ${participant.identity}`);
    
    const participantDiv = document.createElement('div');
    participantDiv.id = `participant-${participant.sid}`;
    participantDiv.className = 'remote-participant';
    participantDiv.innerHTML = `
      <div class="participant-info">
        <span class="participant-name">${participant.identity}</span>
      </div>
      <div class="participant-media"></div>
    `;
    
    document.getElementById('remote-media').appendChild(participantDiv);
    
    // Display existing tracks
    participant.tracks.forEach(publication => {
      if (publication.track) {
        this.trackSubscribed(participantDiv, publication.track);
      }
    });
    
    // Listen for new tracks
    participant.on('trackSubscribed', track => {
      this.trackSubscribed(participantDiv, track);
    });
    
    participant.on('trackUnsubscribed', track => {
      this.trackUnsubscribed(track);
    });
    
    this.remoteParticipants.set(participant.sid, participant);
  }

  /**
   * Handle track subscription
   */
  trackSubscribed(participantDiv, track) {
    const mediaContainer = participantDiv.querySelector('.participant-media');
    const mediaElement = track.attach();
    
    if (track.kind === 'video') {
      mediaElement.classList.add('remote-video');
      mediaElement.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #1f2937;
      `;
    } else if (track.kind === 'audio') {
      mediaElement.classList.add('remote-audio');
    }
    
    mediaContainer.appendChild(mediaElement);
  }

  /**
   * Handle track unsubscription
   */
  trackUnsubscribed(track) {
    track.detach().forEach(element => element.remove());
  }

  /**
   * Handle participant disconnection
   */
  participantDisconnected(participant) {
    console.log(`Participant disconnected: ${participant.identity}`);
    const participantDiv = document.getElementById(`participant-${participant.sid}`);
    if (participantDiv) {
      participantDiv.remove();
    }
    this.remoteParticipants.delete(participant.sid);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Participant events
    this.room.on('participantConnected', participant => {
      this.participantConnected(participant);
    });
    
    this.room.on('participantDisconnected', participant => {
      this.participantDisconnected(participant);
    });
    
    // Room disconnected
    this.room.on('disconnected', room => {
      console.log('Disconnected from room');
      room.localParticipant.tracks.forEach(publication => {
        const track = publication.track;
        track.stop();
        track.detach().forEach(element => element.remove());
      });
    });
    
    // Network quality
    this.room.localParticipant.on('networkQualityLevelChanged', (networkQualityLevel) => {
      console.log('Network quality:', networkQualityLevel);
      this.updateNetworkQualityIndicator(networkQualityLevel);
    });
  }

  /**
   * Toggle microphone mute
   */
  toggleMute() {
    if (!this.localTracks) return;
    
    this.localTracks.forEach(track => {
      if (track.kind === 'audio') {
        if (this.isMuted) {
          track.enable();
        } else {
          track.disable();
        }
      }
    });
    
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Toggle video on/off
   */
  toggleVideo() {
    if (!this.localTracks || !this.isVideoCall) return;
    
    this.localTracks.forEach(track => {
      if (track.kind === 'video') {
        if (this.isVideoOff) {
          track.enable();
        } else {
          track.disable();
        }
      }
    });
    
    this.isVideoOff = !this.isVideoOff;
    return this.isVideoOff;
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera() {
    const videoTrack = this.localTracks.find(track => track.kind === 'video');
    if (!videoTrack) return;
    
    const currentFacingMode = videoTrack.mediaStreamTrack.getSettings().facingMode;
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    // Stop current video track
    videoTrack.stop();
    
    // Create new video track with different camera
    const newVideoTrack = await Twilio.Video.createLocalVideoTrack({
      facingMode: newFacingMode
    });
    
    // Replace old track with new one
    const localParticipant = this.room.localParticipant;
    const trackPublication = Array.from(localParticipant.videoTracks.values())[0];
    await localParticipant.unpublishTrack(videoTrack);
    await localParticipant.publishTrack(newVideoTrack);
    
    // Update local tracks array
    const index = this.localTracks.indexOf(videoTrack);
    this.localTracks[index] = newVideoTrack;
    
    // Re-display local video
    document.getElementById('local-media').innerHTML = '';
    this.displayLocalTracks();
  }

  /**
   * End call and disconnect
   */
  endCall() {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    
    if (this.localTracks) {
      this.localTracks.forEach(track => {
        track.stop();
        track.detach().forEach(element => element.remove());
      });
      this.localTracks = null;
    }
    
    this.remoteParticipants.clear();
    console.log('Call ended');
  }

  /**
   * Update network quality indicator
   */
  updateNetworkQualityIndicator(level) {
    const indicator = document.getElementById('network-quality');
    if (!indicator) return;
    
    const qualityText = ['Poor', 'Fair', 'Good', 'Excellent'];
    const qualityColors = ['text-red-500', 'text-yellow-500', 'text-green-500', 'text-green-600'];
    
    indicator.innerHTML = `
      <i class="fas fa-signal ${qualityColors[level]}"></i>
      <span class="${qualityColors[level]}">${qualityText[level]}</span>
    `;
  }

  /**
   * Get call statistics
   */
  getCallStats() {
    if (!this.room) return null;
    
    return {
      roomName: this.room.name,
      localParticipant: this.room.localParticipant.identity,
      remoteParticipants: Array.from(this.remoteParticipants.values()).map(p => p.identity),
      duration: Date.now() - this.room.localParticipant.connectedAt,
      isVideoCall: this.isVideoCall,
      isMuted: this.isMuted,
      isVideoOff: this.isVideoOff
    };
  }
}

// Export for global use
window.TwilioVideoManager = TwilioVideoManager;
