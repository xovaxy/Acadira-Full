import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings</p>
      </div>

      <Card className="p-6 shadow-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          General Settings
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input
              id="platform-name"
              defaultValue="Acadira"
              placeholder="Platform Name"
            />
          </div>

          <div>
            <Label htmlFor="support-email">Support Email</Label>
            <Input
              id="support-email"
              type="email"
              defaultValue="support@acadira.com"
              placeholder="support@example.com"
            />
          </div>

          <div>
            <Label htmlFor="default-limit">Default Monthly Question Limit</Label>
            <Input
              id="default-limit"
              type="number"
              defaultValue="10000"
              placeholder="10000"
            />
          </div>

          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <h2 className="text-xl font-bold mb-4">AI Configuration</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ai-model">AI Model</Label>
            <Input
              id="ai-model"
              defaultValue="gemini-2.5-flash"
              placeholder="Model name"
              disabled
            />
            <p className="text-sm text-muted-foreground mt-1">
              Currently using Google Gemini 2.5 Flash
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
