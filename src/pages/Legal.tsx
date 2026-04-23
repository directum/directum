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
                Last updated: 4/23/2026
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing, using, or interacting with Directum (“the Service”) in any manner, you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, you must discontinue use of the Service immediately.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. Bot Submission Guidelines</h3>
                <p className="text-muted-foreground mb-3">To maintain a safe and high-quality platform, all bot submissions must adhere to the following:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Bots must comply with Discord’s Terms of Service and Community Guidelines</li>
                  <li>All bot descriptions must be accurate, truthful, and not misleading</li>
                  <li>Bots must not contain malicious code, exploits, or harmful functionality</li>
                  <li>Any NSFW content must be clearly labeled and appropriate within Discord guidelines</li>
                  <li>Spam, duplicate, deceptive, or low-quality submissions may be rejected or removed at our discretion</li>
                </ul>
                <p className="text-muted-foreground mt-3 italic text-sm">
                  Directum reserves the right to deny or remove any submission without prior notice.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. User Responsibilities</h3>
                <p className="text-muted-foreground mb-3">By using Directum, you agree that:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>You are responsible for the accuracy and completeness of all information you provide</li>
                  <li>Bot owners must maintain their bots and ensure information remains up to date</li>
                  <li>You will not engage in vote manipulation, artificial engagement, or fraudulent activity</li>
                  <li>You will treat other users respectfully and contribute to a positive community environment</li>
                </ul>
                <p className="text-muted-foreground mt-3 italic text-sm">
                  Failure to comply may result in content removal, suspension, or termination of your account.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Content Moderation and Enforcement</h3>
                <p className="text-muted-foreground mb-3">Directum reserves the right, but not the obligation, to monitor, review, and moderate content submitted to the platform. We may:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Remove or modify content that violates these Terms</li>
                  <li>Suspend or permanently terminate accounts for violations or repeated misconduct</li>
                  <li>Take any action deemed necessary to protect the integrity of the platform</li>
                </ul>
                <p className="text-muted-foreground mt-3 font-medium">All enforcement decisions are final.</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Disclaimer of Liability</h3>
                <p className="text-muted-foreground mb-3">Directum is a listing platform and does not own, operate, or control third-party bots. Accordingly:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>We do not guarantee the functionality, reliability, or security of any listed bot</li>
                  <li>We are not responsible for any damages, data loss, or issues resulting from interaction with third-party bots</li>
                </ul>
                <p className="text-muted-foreground mt-3">Use of any bot is at your own risk.</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  To the fullest extent permitted by law, Directum and its operators shall not be liable for any indirect, incidental, consequential, or special damages arising from or related to your use of the Service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. Dispute Resolution</h3>
                <p className="text-muted-foreground mb-3">
                  You agree that any dispute, claim, or controversy arising out of or relating to these Terms or your use of Directum shall be resolved exclusively through private, binding resolution.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Disputes must first be attempted to be resolved informally by contacting Directum</li>
                  <li>If unresolved, disputes shall be settled through binding arbitration on an individual basis</li>
                  <li>You waive the right to participate in class actions, class arbitrations, or collective legal proceedings</li>
                  <li>All disputes must be handled confidentially and not pursued in public court except where legally required</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">8. Changes to Terms</h3>
                <p className="text-muted-foreground">
                  Directum reserves the right to modify or update these Terms at any time. Changes become effective immediately upon posting. Continued use of the Service constitutes acceptance of the revised Terms.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">9. Termination</h3>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate access to the Service at any time, with or without notice, for conduct that violates these Terms or is otherwise harmful to the platform or its users.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">10. Contact Information</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Legal:</strong> <a href="mailto:developing.soulnet@gmail.com" className="text-primary hover:underline font-medium">developing.soulnet@gmail.com</a></p>
                  <p><strong>Support:</strong> <a href="https://discord.gg/UHeWA6mXxS" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Discord Server</a></p>
                </div>
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
                <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
                <p className="text-muted-foreground mb-3">We collect information necessary to provide and improve our services, including:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Discord Account Information:</strong> Username, avatar, and Discord ID when you authenticate through Discord</li>
                  <li><strong>Bot Submission Information:</strong> Any details you provide when submitting or managing bots on the platform</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with the Service, including voting, browsing, and engagement activity</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information, and related technical details</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. How We Use Your Information</h3>
                <p className="text-muted-foreground mb-3">We use collected information for legitimate business purposes, including:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Providing, operating, and maintaining the Service</li>
                  <li>Authenticating users and preventing fraud, abuse, or misuse</li>
                  <li>Communicating updates, service announcements, and important notifications</li>
                  <li>Improving platform functionality, performance, and user experience</li>
                  <li>Complying with applicable legal obligations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. Data Sharing and Disclosure</h3>
                <p className="text-muted-foreground mb-3">We respect your privacy and do not sell or rent your personal information. We may disclose information only in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>With your explicit consent</li>
                  <li>To comply with applicable laws, regulations, or legal processes</li>
                  <li>To enforce our Terms of Service or protect our rights and users</li>
                  <li>To detect, prevent, or address fraud, security, or technical issues</li>
                  <li>In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Data Security</h3>
                <p className="text-muted-foreground">
                  We implement reasonable administrative, technical, and organizational safeguards to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no system or method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Data Retention</h3>
                <p className="text-muted-foreground">
                  We retain your information only for as long as necessary to fulfill the purposes outlined in this Policy, unless a longer retention period is required or permitted by law.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Your Privacy Rights</h3>
                <p className="text-muted-foreground mb-3">Depending on your location and applicable laws, you may have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Access and review the personal data we hold about you</li>
                  <li>Request correction of inaccurate or incomplete information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Withdraw consent where processing is based on consent</li>
                  <li>Object to or restrict certain types of data processing</li>
                </ul>
                <p className="text-muted-foreground mt-3 italic text-sm italic">Requests may be subject to identity verification and applicable legal limitations.</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. Cookies and Tracking Technologies</h3>
                <p className="text-muted-foreground mb-3">We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Authenticate users and maintain session integrity</li>
                  <li>Enhance functionality and user experience</li>
                  <li>Analyze usage patterns and improve the Service</li>
                </ul>
                <p className="text-muted-foreground mt-3">You may control or disable cookies through your browser settings; however, doing so may affect certain features of the Service.</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">8. Third-Party Services</h3>
                <p className="text-muted-foreground">
                  Directum may integrate with or rely on third-party services (such as Discord). We are not responsible for the privacy practices of third parties, and we encourage you to review their policies separately.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">9. Children’s Privacy</h3>
                <p className="text-muted-foreground">
                  The Service is not intended for individuals under the age required by Discord’s Terms of Service. We do not knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">10. Changes to This Privacy Policy</h3>
                <p className="text-muted-foreground">
                  We reserve the right to update or modify this Privacy Policy at any time. Changes become effective upon posting. Continued use of the Service constitutes acceptance of the updated Policy.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">11. Contact Us</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Legal:</strong> <a href="mailto:developing.soulnet@gmail.com" className="text-primary hover:underline font-medium">developing.soulnet@gmail.com</a></p>
                  <p><strong>Support:</strong> <a href="https://discord.gg/UHeWA6mXxS" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Discord Server</a></p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Legal;