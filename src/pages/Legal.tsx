import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Legal = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back to Home Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">Legal Information</h1>
            <p className="text-muted-foreground text-lg">
              Terms of Service and Privacy Policy for Directum Bot Listing
            </p>
          </div>

          {/* Terms of Service */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Terms of Service</CardTitle>
              <CardDescription>
                {/*w Date().toLocaleDateString()*/}
                Last updated: 4/15/2026
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing and using Directum, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. Bot Submission Guidelines</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Bots must comply with Discord's Terms of Service and Community Guidelines</li>
                  <li>Bot descriptions must be accurate and not misleading</li>
                  <li>Bots must not contain malicious code or harmful functionality</li>
                  <li>NSFW content must be clearly marked and appropriate</li>
                  <li>Spam, duplicate, or low-quality bot submissions will be rejected</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. User Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Users are responsible for the accuracy of their bot information</li>
                  <li>Bot owners must maintain their bots and keep information updated</li>
                  <li>Users must not engage in vote manipulation or fraudulent activities</li>
                  <li>Respect other users and maintain a positive community environment</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Content Moderation</h3>
                <p className="text-muted-foreground">
                  Directum reserves the right to review, moderate, and remove any bot listings that violate these terms. 
                  We may also suspend or terminate user accounts for repeated violations.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Disclaimer</h3>
                <p className="text-muted-foreground">
                  Directum is not responsible for the functionality, security, or actions of third-party bots listed on our platform. 
                  Users interact with bots at their own risk.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Changes to Terms</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.
                </p>
              </section>
            </CardContent>
          </Card>

          <Separator />

          {/* Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
              <CardDescription>
                How we collect, use, and protect your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Discord Account Information:</strong> Username, avatar, and Discord ID when you sign in</li>
                  <li><strong>Bot Information:</strong> Details you provide when submitting bots for listing</li>
                  <li><strong>Usage Data:</strong> How you interact with our platform (voting, browsing, etc.)</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, and device information</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>To provide and maintain our bot listing service</li>
                  <li>To authenticate users and prevent fraud</li>
                  <li>To communicate important updates and notifications</li>
                  <li>To improve our platform and user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Data Sharing</h3>
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. We may share information only:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>In connection with a business transfer</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Data Security</h3>
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your information against unauthorized access, 
                  alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Access and review your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Cookies</h3>
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to enhance your experience, authenticate users, and analyze usage patterns. 
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have questions about these policies or wish to exercise your privacy rights, 
                  please contact us through our Discord server or submit a support request.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Legal;