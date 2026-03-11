import React from "react";
import { useFeaturedVideo } from "@/hooks/useFeaturedVideo";
import { getVideoEmbedUrl } from "@/lib/video-utils";
import type { FeaturedVideo, VideoType } from "@/types/media";

const VideoSection = () => {
  const { data, isLoading } = useFeaturedVideo(true);
  const video = data as FeaturedVideo | null;

  // Don't render if no video from CMS
  if (isLoading) {
    return (
      <section className="relative z-10 -mb-20 md:-mb-28 bg-muted/30">
        <div className="container mx-auto px-5 md:px-10 lg:px-20">
          <div className="max-w-xl mx-auto">
            <div className="relative w-full aspect-video rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm overflow-hidden shadow-2xl bg-muted animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!video) {
    return null;
  }

  const videoUrl = getVideoEmbedUrl(video.video_url, video.video_type as VideoType);

  return (
    <section className="relative z-10 -mb-20 md:-mb-28 bg-transparent">
      <div className="container mx-auto px-5 md:px-10 lg:px-20">
        <div className="max-w-xl mx-auto">
          <div className="relative w-full aspect-video rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm overflow-hidden shadow-2xl">
            <iframe
              src={videoUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {video.description && (
            <div className="mt-4 text-center">
              <p className="text-foreground/70 text-sm">{video.description}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;