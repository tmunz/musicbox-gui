export class SpotifyService {
  private accessToken: string | null = null;
  private authServerUrl = 'https://spotify-auth-tmusic.vercel.app';
  private player: any = null;
  private deviceId: string | null = null;

  async authenticate(): Promise<boolean> {
    try {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        this.accessToken = accessToken;
        localStorage.setItem('spotify_access_token', accessToken);
        window.location.hash = '';
        return true;
      }

      const storedToken = localStorage.getItem('spotify_access_token');
      if (storedToken) {
        this.accessToken = storedToken;
        return true;
      }
      const currentOrigin = window.location.origin;
      const loginUrl = `${this.authServerUrl}/login?origin=${encodeURIComponent(currentOrigin)}`;
      window.location.href = loginUrl;
      return false;
    } catch (error) {
      console.error('Spotify authentication failed:', error);
      return false;
    }
  }

  async playAlbumAndGetCurrentTrack(): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Spotify');
    }

    try {
      if (!this.player) {
        await this.initializeWebPlayback();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (!this.deviceId) {
        throw new Error('Spotify device not ready. Please try again in a moment.');
      }

      // Hardcoded album ID from the URL: https://open.spotify.com/intl-de/album/5Dgqy4bBg09Rdw7CQM545s
      const albumId = '5Dgqy4bBg09Rdw7CQM545s';
      
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [this.deviceId],
          play: false
        })
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const playResponse = await fetch(
        'https://api.spotify.com/v1/me/player/play',
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context_uri: `spotify:album:${albumId}`,
            device_id: this.deviceId
          }),
        }
      );

      if (!playResponse.ok) {
        throw new Error(`Failed to play album: ${playResponse.status} ${playResponse.statusText}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      const currentResponse = await fetch(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        if (currentData && currentData.item) {
          return {
            ...currentData.item,
            is_playing: currentData.is_playing,
            progress_ms: currentData.progress_ms
          };
        }
      }

      const albumResponse = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (albumResponse.ok) {
        const albumData = await albumResponse.json();
        if (albumData.tracks?.items?.[0]) {
          return albumData.tracks.items[0];
        }
      }

      throw new Error('Could not get track information');
    } catch (error) {
      console.error('Failed to play album and get track:', error);
      throw error;
    }
  }

  async initializeWebPlayback(): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Spotify');
    }

    return new Promise((resolve, reject) => {
      if (!(window as any).Spotify) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.head.appendChild(script);

        (window as any).onSpotifyWebPlaybackSDKReady = () => {
          this.setupPlayer().then(resolve).catch(reject);
        };
      } else {
        this.setupPlayer().then(resolve).catch(reject);
      }
    });
  }

  private async setupPlayer(): Promise<boolean> {
    const SpotifyPlayer = (window as any).Spotify.Player;
    
    this.player = new SpotifyPlayer({
      name: 'TMusic Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(this.accessToken!);
      },
      volume: 0.8,
      enableMediaSession: true
    });

    // Error handling
    this.player.addListener('initialization_error', ({ message }: any) => {
      console.error('Spotify Player initialization error:', message);
    });

    this.player.addListener('authentication_error', ({ message }: any) => {
      console.error('Spotify Player authentication error:', message);
    });

    this.player.addListener('account_error', ({ message }: any) => {
      console.error('Spotify Player account error:', message);
    });

    this.player.addListener('playback_error', ({ message }: any) => {
      console.error('Spotify Player playback error:', message);
    });

    this.player.addListener('ready', ({ device_id }: any) => {
      console.log('Spotify Player ready with device ID:', device_id);
      this.deviceId = device_id;
    });

    this.player.addListener('not_ready', ({ device_id }: any) => {
      console.log('Spotify Player not ready with device ID:', device_id);
    });

    const success = await this.player.connect();
    return success;
  }

  async stopPlayback(): Promise<void> {
    if (this.player) {
      try {
        await this.player.pause();
        console.log('Spotify playback stopped');
      } catch (error) {
        console.error('Error stopping Spotify playback:', error);
      }
    }
  }
}
