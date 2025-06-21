
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LogoUploadProps {
  logo?: string;
  onLogoChange: (logo: string | undefined) => void;
  label: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ logo, onLogoChange, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onLogoChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {logo ? (
        <Card className="w-32 h-32">
          <CardContent className="p-2 h-full relative">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-full h-full object-contain rounded"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0"
              onClick={handleRemoveLogo}
            >
              <X className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
          <CardContent 
            className="p-2 h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-8 w-8 mb-2" />
            <span className="text-xs text-center">Click to upload logo</span>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {logo ? 'Change Logo' : 'Upload Logo'}
      </Button>
    </div>
  );
};

export default LogoUpload;
