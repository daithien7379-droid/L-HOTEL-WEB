import React, { useState, useRef, useEffect } from 'react';
import { SafeGuestBooking } from '../../types';
import { provideGuestIdentity, provideGuestIdentityDocument } from '../../services/api';
import {
  ShieldAlert,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Lock,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface IdentityScreenProps {
  sessionToken: string;
  guestName: string;
  bookingCode: string;
  expiresAt: string;
  onSuccess: (booking: SafeGuestBooking, sessionToken: string, expiresAt: string) => void;
  onCancel: () => void;
}

type Mode = 'select' | 'text' | 'camera';
type DocType = 'CCCD' | 'PASSPORT';
type CameraStep = 'select_doc' | 'front' | 'back' | 'passport' | 'review';

export const IdentityScreen: React.FC<IdentityScreenProps> = ({
  sessionToken,
  guestName,
  bookingCode,
  expiresAt,
  onSuccess,
  onCancel,
}) => {
  const [mode, setMode] = useState<Mode>('select');
  const [docType, setDocType] = useState<DocType>('CCCD');
  
  // Text input state
  const [identityInput, setIdentityInput] = useState('');
  
  // Camera state
  const [cameraStep, setCameraStep] = useState<CameraStep>('select_doc');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [passportImage, setPassportImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturingPreview, setIsCapturingPreview] = useState<string | null>(null);

  // Loading & error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start Camera
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsCapturingPreview(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Thiết bị hoặc trình duyệt không hỗ trợ truy cập camera trực tiếp.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera prioritized for document capture
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError(
        'Không thể truy cập camera. Vui lòng cấp quyền sử dụng camera cho trình duyệt hoặc sử dụng phương thức nhập số CCCD / Passport.'
      );
    }
  };

  // Capture frame from active video stream
  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setIsCapturingPreview(dataUrl);
    stopCamera();
  };

  // Switch to text mode
  const handleSelectTextMode = () => {
    stopCamera();
    setErrorMessage(null);
    setMode('text');
  };

  // Switch to camera mode
  const handleSelectCameraMode = () => {
    setErrorMessage(null);
    setCameraError(null);
    setMode('camera');
    setCameraStep('select_doc');
  };

  // Submit Text Identity
  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identityInput.trim();
    if (!cleanId) {
      setErrorMessage('Vui lòng nhập số CCCD hoặc Passport.');
      return;
    }
    if (cleanId.length < 4 || cleanId.length > 30 || /[<>{}\\]/.test(cleanId)) {
      setErrorMessage('Vui lòng kiểm tra lại số CCCD / Passport.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await provideGuestIdentity(
        sessionToken,
        cleanId,
        /^\d{9,12}$/.test(cleanId) ? 'CCCD' : 'PASSPORT'
      );
      if (res.success && res.data) {
        onSuccess(res.data, sessionToken, expiresAt);
      } else {
        setErrorMessage(res.message || 'Không thể xác nhận số CCCD / Passport. Vui lòng thử lại.');
      }
    } catch {
      setErrorMessage('Không thể kết nối máy chủ để lưu thông tin. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Begin capturing a specific step
  const handleStartCaptureStep = (step: 'front' | 'back' | 'passport') => {
    setCameraStep(step);
    setIsCapturingPreview(null);
    startCamera();
  };

  // Accept current preview photo
  const handleAcceptPreview = () => {
    if (!isCapturingPreview) return;

    if (cameraStep === 'front') {
      setFrontImage(isCapturingPreview);
      setIsCapturingPreview(null);
      // Next is back side
      handleStartCaptureStep('back');
    } else if (cameraStep === 'back') {
      setBackImage(isCapturingPreview);
      setIsCapturingPreview(null);
      setCameraStep('review');
    } else if (cameraStep === 'passport') {
      setPassportImage(isCapturingPreview);
      setIsCapturingPreview(null);
      setCameraStep('review');
    }
  };

  // Retake photo
  const handleRetakePhoto = () => {
    setIsCapturingPreview(null);
    startCamera();
  };

  // Final upload documents
  const handleFinalSubmitDocuments = async () => {
    if (docType === 'CCCD') {
      if (!frontImage || !backImage) {
        setErrorMessage('Vui lòng chụp đầy đủ mặt trước và mặt sau giấy tờ.');
        return;
      }
    } else {
      if (!passportImage) {
        setErrorMessage('Vui lòng chụp ảnh mặt thông tin Passport.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await provideGuestIdentityDocument(sessionToken, {
        identityType: docType,
        frontImage: frontImage || undefined,
        backImage: backImage || undefined,
        passportImage: passportImage || undefined,
      });

      if (res.success && res.data) {
        onSuccess(res.data, sessionToken, expiresAt);
      } else {
        setErrorMessage(res.message || 'Không thể tải ảnh giấy tờ lên. Vui lòng thử lại.');
      }
    } catch {
      setErrorMessage('Không thể tải ảnh giấy tờ lên. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="identity-screen-container" className="max-w-xl mx-auto px-4 pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#DFECE4] relative overflow-hidden">
        {/* Header Notice Strip */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[#EEF5F1]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F1EC] flex items-center justify-center text-[#0F5B43] shrink-0 border border-[#C6DDD0]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F5B43]">
                XÁC NHẬN THÔNG TIN NHẬN PHÒNG
              </h2>
              <p className="text-xs text-[#627A6E]">
                Booking: <strong className="font-mono text-[#0F5B43]">{bookingCode}</strong> • Khách:{' '}
                <strong>{guestName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl text-[#627A6E] hover:text-[#0F5B43] hover:bg-[#FAF9F4] transition-colors text-xs font-semibold"
            title="Quay lại trang tra cứu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Explain Card */}
        <div className="bg-[#FAF9F4] border border-[#D5E4DC] rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-[#1F2924] mb-1">
            Khách sạn chưa có thông tin CCCD / Passport của bạn.
          </p>
          <p className="text-xs text-[#526B5E] leading-relaxed">
            Vui lòng cung cấp thông tin để hoàn tất thủ tục nhận phòng và hiển thị mật khẩu mở khóa cửa.
          </p>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage}</span>
              {errorMessage.includes('Không thể tải ảnh') && (
                <button
                  type="button"
                  onClick={handleFinalSubmitDocuments}
                  className="block mt-1 font-bold underline hover:text-red-900"
                >
                  [ THỬ LẠI ]
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: METHOD SELECTION */}
        {/* ========================================================================= */}
        {mode === 'select' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-[#354D41]">
              Chọn phương thức cung cấp thông tin:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1 Button */}
              <button
                type="button"
                id="btn-select-identity-text"
                onClick={handleSelectTextMode}
                className="p-5 rounded-2xl border-2 border-[#D5E4DC] hover:border-[#0F5B43] bg-white hover:bg-[#F4F9F6] text-left transition-all group flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F1EC] text-[#0F5B43] flex items-center justify-center group-hover:bg-[#0F5B43] group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A2B8AC] group-hover:text-[#0F5B43]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2924] text-sm group-hover:text-[#0F5B43]">
                    NHẬP CCCD / PASSPORT
                  </h3>
                  <p className="text-[11px] text-[#6A8577] mt-1">
                    Nhập dãy số CCCD Việt Nam hoặc số Hộ chiếu cá nhân
                  </p>
                </div>
              </button>

              {/* Option 2 Button */}
              <button
                type="button"
                id="btn-select-identity-camera"
                onClick={handleSelectCameraMode}
                className="p-5 rounded-2xl border-2 border-[#D5E4DC] hover:border-[#0F5B43] bg-white hover:bg-[#F4F9F6] text-left transition-all group flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F1EC] text-[#0F5B43] flex items-center justify-center group-hover:bg-[#0F5B43] group-hover:text-white transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A2B8AC] group-hover:text-[#0F5B43]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2924] text-sm group-hover:text-[#0F5B43]">
                    CHỤP ẢNH GIẤY TỜ
                  </h3>
                  <p className="text-[11px] text-[#6A8577] mt-1">
                    Sử dụng camera thiết bị chụp ảnh mặt trước và mặt sau
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-3 border-t border-[#EEF5F1] flex items-center justify-between text-xs text-[#6A8577]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0F5B43]" />
                Bảo mật mã hóa theo tiêu chuẩn lưu trú Lá Hotel
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: OPTION 1 - TEXT INPUT */}
        {/* ========================================================================= */}
        {mode === 'text' && (
          <form onSubmit={handleSubmitText} className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1.5">
                CCCD / PASSPORT <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={identityInput}
                onChange={(e) => {
                  setIdentityInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Nhập số CCCD hoặc Passport"
                className="w-full px-4 py-3.5 bg-[#FAF9F4] border-2 border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-2xl text-base font-mono outline-none transition-all placeholder:text-[#9FB5A9]"
              />
              <p className="text-[11px] text-[#6A8577] mt-1.5">
                Ví dụ: <strong>079123456789</strong> hoặc số hộ chiếu <strong>P12345678</strong>
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#D5E4DC] hover:bg-[#FAF9F4] text-[#354D41] text-xs font-bold transition-colors"
              >
                QUAY LẠI
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !identityInput.trim()}
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-[#0F5B43] hover:bg-[#0D4E3A] text-white text-sm font-bold shadow-md shadow-[#0F5B43]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ĐANG LƯU THÔNG TIN...</span>
                  </>
                ) : (
                  <span>XÁC NHẬN</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: OPTION 2 - CAMERA CAPTURE */}
        {/* ========================================================================= */}
        {mode === 'camera' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Step 1: Choose Document Type (CCCD vs Passport) */}
            {cameraStep === 'select_doc' && (
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#354D41]">
                  CHỌN LOẠI GIẤY TỜ
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDocType('CCCD')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      docType === 'CCCD'
                        ? 'border-[#0F5B43] bg-[#E8F1EC] text-[#0F5B43] font-bold shadow-xs'
                        : 'border-[#D5E4DC] bg-white text-[#354D41] hover:bg-[#FAF9F4]'
                    }`}
                  >
                    <div className="text-sm font-bold">○ CCCD</div>
                    <div className="text-[11px] text-[#6A8577] mt-0.5">Chụp mặt trước + mặt sau</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDocType('PASSPORT')}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      docType === 'PASSPORT'
                        ? 'border-[#0F5B43] bg-[#E8F1EC] text-[#0F5B43] font-bold shadow-xs'
                        : 'border-[#D5E4DC] bg-white text-[#354D41] hover:bg-[#FAF9F4]'
                    }`}
                  >
                    <div className="text-sm font-bold">○ PASSPORT</div>
                    <div className="text-[11px] text-[#6A8577] mt-0.5">Chụp mặt thông tin</div>
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('select')}
                    className="px-5 py-3 rounded-xl border border-[#D5E4DC] hover:bg-[#FAF9F4] text-[#354D41] text-xs font-bold transition-colors"
                  >
                    QUAY LẠI
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (docType === 'CCCD') {
                        handleStartCaptureStep('front');
                      } else {
                        handleStartCaptureStep('passport');
                      }
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-[#0F5B43] hover:bg-[#0D4E3A] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0F5B43]/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>MỞ CAMERA BẮT ĐẦU CHỤP</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2/3: Live Camera or Photo Preview */}
            {(cameraStep === 'front' || cameraStep === 'back' || cameraStep === 'passport') && (
              <div className="space-y-4">
                {/* Step Title Indicator */}
                <div className="flex items-center justify-between bg-[#E8F1EC] px-4 py-2.5 rounded-xl text-[#0F5B43]">
                  <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    {cameraStep === 'front' && 'CHỤP MẶT TRƯỚC (CCCD)'}
                    {cameraStep === 'back' && 'CHỤP MẶT SAU (CCCD)'}
                    {cameraStep === 'passport' && 'CHỤP MẶT THÔNG TIN PASSPORT'}
                  </span>
                  <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md">
                    {cameraStep === 'front' && 'Bước 1/2'}
                    {cameraStep === 'back' && 'Bước 2/2'}
                    {cameraStep === 'passport' && '1 mặt chính'}
                  </span>
                </div>

                <p className="text-xs text-[#526B5E]">
                  {cameraStep === 'front' &&
                    'Vui lòng đặt mặt trước CCCD / Passport vào khung và chụp ảnh.'}
                  {cameraStep === 'back' && 'Vui lòng lật giấy tờ và chụp mặt sau.'}
                  {cameraStep === 'passport' &&
                    'Vui lòng đặt trang thông tin chính của Passport vào khung và chụp ảnh.'}
                </p>

                {/* Camera Error Display */}
                {cameraError ? (
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-[#92400E] text-xs space-y-3">
                    <div className="flex items-start gap-2.5 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <span>{cameraError}</span>
                    </div>
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs"
                      >
                        THỬ LẠI CAMERA
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectTextMode}
                        className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100"
                      >
                        NHẬP SỐ CCCD / PASSPORT
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Camera Frame / Preview Area */
                  <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#0F5B43] shadow-lg min-h-[260px] sm:min-h-[340px] flex items-center justify-center">
                    {isCapturingPreview ? (
                      /* Captured Preview */
                      <img
                        src={isCapturingPreview}
                        alt="Preview"
                        className="w-full h-full max-h-[380px] object-contain"
                      />
                    ) : (
                      /* Live Camera View */
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full max-h-[380px] object-cover"
                        />
                        {/* Guiding Frame Overlay */}
                        <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex items-center justify-center">
                          <span className="bg-black/60 text-white text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
                            ĐẶT GIẤY TỜ VÀO ĐÂY
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Control Buttons */}
                {!cameraError && (
                  <div>
                    {isCapturingPreview ? (
                      /* Photo Preview Confirmation Buttons */
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="py-3 rounded-xl border-2 border-[#D5E4DC] hover:bg-[#FAF9F4] text-[#354D41] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>CHỤP LẠI</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAcceptPreview}
                          className="py-3 rounded-xl bg-[#0F5B43] hover:bg-[#0D4E3A] text-white text-xs font-bold transition-colors shadow-md shadow-[#0F5B43]/20 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>SỬ DỤNG ẢNH</span>
                        </button>
                      </div>
                    ) : (
                      /* Live Camera Capture Trigger Button */
                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            stopCamera();
                            setCameraStep('select_doc');
                          }}
                          className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#D5E4DC] hover:bg-[#FAF9F4] text-[#354D41] text-xs font-bold transition-colors"
                        >
                          QUAY LẠI
                        </button>

                        <button
                          type="button"
                          id="btn-capture-camera-shot"
                          onClick={captureFrame}
                          disabled={!isCameraActive}
                          className="w-full sm:flex-1 py-3.5 rounded-xl bg-[#0F5B43] hover:bg-[#0D4E3A] text-white text-sm font-bold shadow-md shadow-[#0F5B43]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                          <span>● CHỤP ẢNH</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Final Document Confirmation & Upload */}
            {cameraStep === 'review' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0F5B43]">
                  XÁC NHẬN GIẤY TỜ
                </div>

                {docType === 'CCCD' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Front preview */}
                    <div className="border border-[#D5E4DC] rounded-xl p-2 bg-[#FAF9F4]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#354D41] mb-1.5">
                        <span>Mặt trước</span>
                        <button
                          type="button"
                          onClick={() => handleStartCaptureStep('front')}
                          className="text-[#0F5B43] hover:underline font-normal"
                        >
                          Chụp lại
                        </button>
                      </div>
                      <div className="rounded-lg overflow-hidden bg-black h-28 flex items-center justify-center">
                        {frontImage && (
                          <img
                            src={frontImage}
                            alt="Front"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </div>

                    {/* Back preview */}
                    <div className="border border-[#D5E4DC] rounded-xl p-2 bg-[#FAF9F4]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#354D41] mb-1.5">
                        <span>Mặt sau</span>
                        <button
                          type="button"
                          onClick={() => handleStartCaptureStep('back')}
                          className="text-[#0F5B43] hover:underline font-normal"
                        >
                          Chụp lại
                        </button>
                      </div>
                      <div className="rounded-lg overflow-hidden bg-black h-28 flex items-center justify-center">
                        {backImage && (
                          <img
                            src={backImage}
                            alt="Back"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Passport preview */
                  <div className="border border-[#D5E4DC] rounded-xl p-2 bg-[#FAF9F4]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#354D41] mb-1.5">
                      <span>Mặt thông tin Passport</span>
                      <button
                        type="button"
                        onClick={() => handleStartCaptureStep('passport')}
                        className="text-[#0F5B43] hover:underline font-normal"
                      >
                        Chụp lại
                      </button>
                    </div>
                    <div className="rounded-lg overflow-hidden bg-black h-40 flex items-center justify-center">
                      {passportImage && (
                        <img
                          src={passportImage}
                          alt="Passport"
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCameraStep('select_doc');
                    }}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#D5E4DC] hover:bg-[#FAF9F4] text-[#354D41] text-xs font-bold transition-colors"
                  >
                    QUAY LẠI
                  </button>

                  <button
                    type="button"
                    id="btn-confirm-and-continue-docs"
                    onClick={handleFinalSubmitDocuments}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3.5 rounded-xl bg-[#0F5B43] hover:bg-[#0D4E3A] text-white text-sm font-bold shadow-md shadow-[#0F5B43]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>ĐANG TẢI ẢNH LÊN...</span>
                      </>
                    ) : (
                      <span>XÁC NHẬN VÀ TIẾP TỤC</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
