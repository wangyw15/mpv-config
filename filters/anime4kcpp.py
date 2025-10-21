import vapoursynth as vs
from vapoursynth import core

# models
# acnet-gan         Lightweight CNN, detail enhancement.
# acnet-hdn0        Lightweight CNN, mild denoising.
# acnet-hdn1        Lightweight CNN, moderate denoising.
# acnet-hdn2        Lightweight CNN, heavy denoising.
# acnet-hdn3        Lightweight CNN, extreme denoising.
# arnet-hdn         Lightweight ResNet, mild denoising.

# processors
# cpu               General-purpose CPU processing with optional SIMD acceleration.
# opencl            Cross-platform acceleration requiring OpenCL 1.2+ compliant devices.
# cuda              NVIDIA GPU acceleration requiring Compute Capability 5.0+.

model = "acnet-hdn1"
factor = 2.0
if user_data:
    splitted = user_data.split(";")  # model;factor
    model = splitted[0]
    factor = 2.0 if len(splitted) == 1 else float(splitted[1])

clip = video_in.resize.Point(format=vs.YUV420P8,dither_type="random")
upscaled = core.anime4kcpp.ACUpscale(clip, factor, "cuda", 0, model)
upscaled.set_output()
