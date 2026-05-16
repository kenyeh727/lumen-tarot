import { TextShimmer } from '@/components/ui/text-shimmer';

export function TextShimmerLoading() {
    return (
        <div className='flex flex-col space-y-8 p-12 bg-[#08090c] min-h-screen text-white'>
            <div className='space-y-2'>
                <TextShimmer className='text-4xl font-bold tracking-tight' duration={3}>
                    Loading page content...
                </TextShimmer>
                <p className='text-muted-foreground'>
                    Fetching data from the server, please wait a moment.
                </p>
            </div>

            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className='flex items-center space-x-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm'>
                        <div className='h-12 w-12 animate-pulse rounded-full bg-white/10' />
                        <div className='space-y-3 flex-1'>
                            <TextShimmer className='text-lg font-medium'>
                                Loading item details...
                            </TextShimmer>
                            <TextShimmer className='text-xs opacity-70' duration={2.5}>
                                Processing request...
                            </TextShimmer>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default {
    TextShimmerLoading
}
