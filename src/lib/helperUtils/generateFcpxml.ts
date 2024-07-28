import { OutlineElementWithVideoTitle } from '@/app/outline/page';

export function generateFcpxml(outlineElements: OutlineElementWithVideoTitle[]): string {
  const fcpxmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE fcpxml>
  <fcpxml version="1.8">
    <resources>
      ${outlineElements.map(element => `
        <asset id="${element.id}" src="https://www.youtube.com/watch?v=${element.video_id}" start="${element.video_start_time}" duration="${element.video_end_time}" />
      `).join('')}
    </resources>
    <library>
      <event name="Outline Event">
        <project name="Outline Project">
          <sequence duration="3600s" format="r1">
            <spine>
              ${outlineElements.map(element => `
                <clip name="${element.video_title}" offset="${element.position_start_time}" duration="${element.position_end_time}" start="${element.video_start_time}">
                  <video ref="${element.id}" />
                </clip>
              `).join('')}
            </spine>
          </sequence>
        </project>
      </event>
    </library>
  </fcpxml>`;

  return fcpxmlHeader;
}