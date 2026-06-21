export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem('access_token');
  
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetch(url, { ...options, headers });

  // If 401 Unauthorized, attempt to refresh token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch('/api/auth/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.success && data.access_token) {
            // Save new access token
            localStorage.setItem('access_token', data.access_token);
            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Retry original request with new token
            headers.set('Authorization', `Bearer ${data.access_token}`);
            response = await fetch(url, { ...options, headers });
          } else {
            // Refresh failed structurally
            throw new Error('Refresh failed');
          }
        } else {
          // Refresh endpoint returned error (e.g. 401 or 403)
          throw new Error('Refresh rejected');
        }
      } catch (err) {
        // If refresh fails, clear storage and redirect to login
        console.error('Session expired or invalid, logging out...', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else {
      // No refresh token available, force logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return response;
}
