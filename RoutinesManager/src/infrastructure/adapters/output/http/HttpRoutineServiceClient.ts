import axios, { AxiosInstance } from 'axios';
import { RoutineServiceClient, RoutineDetails } from '../../../../application/ports/output/RoutineServiceClient';

export class HttpRoutineServiceClient implements RoutineServiceClient {
  private readonly client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getRoutineDetails(routineId: string): Promise<RoutineDetails> {
  try {
    const response = await this.client.get(`/rutinas-default/${routineId}`);
    
    const data = response.data;
    
    return {
      id: data.id,
      name: data.nombre,
      description: data.descripcion || '',
      ejercicios: data.ejercicios || [],
      Alimentos: data.alimentos || [],
      isPublic: data.publicada !== false
    };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(`Routine ${routineId} not found`);
    }
    throw new Error(`Failed to fetch routine details: ${error.message}`);
  }
}

  async getMultipleRoutines(routineIds: string[]): Promise<RoutineDetails[]> {
    try {
      const promises = routineIds.map(id => 
        this.getRoutineDetails(id).catch(err => {
          console.warn(`Failed to fetch routine ${id}:`, err.message);
          return null;
        })
      );
      
      const results = await Promise.all(promises);
      return results.filter((r): r is RoutineDetails => r !== null);
    } catch (error) {
      console.error('Failed to fetch multiple routines:', error);
      return [];
    }
  }

}