import { Tables } from '@/lib/types/schema';
type OutlineElement = Tables<'outline_elements'>;

  export function calculatePosition(start: string, end: string, outlineElements: any[]) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const firstElement = outlineElements[0];
    const lastElement = outlineElements[outlineElements.length - 1];
  
    if (!firstElement.position_start_time || !lastElement.position_end_time) {
      return { left: '0%', width: '0%' };
    }
  
    const totalDuration = new Date(lastElement.position_end_time).getTime() - new Date(firstElement.position_start_time).getTime();
    const left = ((startTime - new Date(firstElement.position_start_time).getTime()) / totalDuration) * 100;
    const width = ((endTime - startTime) / totalDuration) * 100;
  
    return { left: `${left}%`, width: `${width}%` };
  }
  
  export function calculatePositionForOrdering(start: string, end: string, timelineStart: string, timelineEnd: string) {
    const startTime = new Date(`1970-01-01T${start}Z`).getTime();
    const endTime = new Date(`1970-01-01T${end}Z`).getTime();
    const timelineStartTime = new Date(`1970-01-01T${timelineStart}Z`).getTime();
    const timelineEndTime = new Date(`1970-01-01T${timelineEnd}Z`).getTime();
  
    const totalDuration = timelineEndTime - timelineStartTime;
    const left = ((startTime - timelineStartTime) / totalDuration) * 100;
    const width = ((endTime - startTime) / totalDuration) * 100;
  
    return { left: `${left}%`, width: `${width}%` };
  }
  
  export function calculateNewTime(clientX: number, timelineRef: React.RefObject<HTMLDivElement>, outlineElements: any[]) {
    if (!timelineRef.current) return new Date().toISOString();
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const firstElementStartTime = outlineElements[0]?.position_start_time;
    const lastElementEndTime = outlineElements[outlineElements.length - 1]?.position_end_time;
  
    if (!firstElementStartTime || !lastElementEndTime) return new Date().toISOString();
  
    const totalDuration = new Date(lastElementEndTime).getTime() - new Date(firstElementStartTime).getTime();
    const newTime = new Date(new Date(firstElementStartTime).getTime() + ((clientX - timelineRect.left) / timelineRect.width) * totalDuration);
    return newTime.toISOString();
  }
  
  export function calculateOutlineDuration(outlineElements: OutlineElement[]): number {
    if (outlineElements.length === 0) return 0;
    const startTime = outlineElements[0].position_start_time ? new Date(outlineElements[0].position_start_time ?? 0).getTime() : 0;
    const endTime = outlineElements[outlineElements.length - 1].position_end_time ? new Date(outlineElements[outlineElements.length - 1].position_end_time ?? 0).getTime() : 0;
    return Math.round((endTime - startTime) / 1000);
  }

  export function formatDuration(duration: number) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };