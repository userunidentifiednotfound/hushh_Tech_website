import React from "react";
import {
  Container,
  Box,
  Heading,
  Text,
  Divider,
  VStack,
} from "@chakra-ui/react";

const TermsOfServicePage: React.FC = () => {
  return (
    <>
      <Box textAlign="center" mt={{ md: '5rem', base: '2rem' }} mb={10}>
        <Heading
          as="h1"
          size="2xl"
          fontWeight={'500'}
          className="blue-gradient-text"
          my={{ md: '5rem', base: '2rem' }}
        >
          Terms of Service
        </Heading>
      </Box>
      <Container maxW="container.lg" py={10} px={4}>
        <VStack spacing={8} align="stretch">
          {/* Last Updated */}
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.600">
              Last Updated: May 6, 2026
            </Text>
          </Box>
          <Divider />

          {/* Acceptance of Terms */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              1. Acceptance of Terms
            </Heading>
            <Text>
              By accessing and using Hushh Technologies LLC's ("Hushh") website and services (collectively, the "Services"), you accept and agree to be bound by the terms and provisions of this agreement ("Terms of Service" or "Terms"). If you do not agree to these Terms, please do not use our Services.
            </Text>
            <Text mt={4}>
              These Terms constitute a legally binding agreement between you and Hushh Technologies LLC. Your continued use of the Services constitutes your acceptance of any modifications to these Terms.
            </Text>
          </Box>
          <Divider />

          {/* Use License */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              2. Use License
            </Heading>
            <Text mb={4}>
              Permission is granted to temporarily access the materials (information or software) on Hushh's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </Text>
            <Box pl={4}>
              <Text>• Modify or copy the materials;</Text>
              <Text>• Use the materials for any commercial purpose or for any public display (commercial or non-commercial);</Text>
              <Text>• Attempt to decompile or reverse engineer any software contained on Hushh's website;</Text>
              <Text>• Remove any copyright or other proprietary notations from the materials;</Text>
              <Text>• Transfer the materials to another person or "mirror" the materials on any other server.</Text>
            </Box>
            <Text mt={4}>
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by Hushh at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
            </Text>
          </Box>
          <Divider />

          {/* Investment Disclaimer */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              3. Investment Disclaimer
            </Heading>
            <Text mb={4}>
              Investment involves risk, including the possible loss of principal. Past performance does not guarantee future results. The information provided through our Services is for informational purposes only and should not be construed as investment advice.
            </Text>
            <Text mb={4}>
              Before making any investment decisions, you should:
            </Text>
            <Box pl={4}>
              <Text>• Consult with a qualified financial advisor;</Text>
              <Text>• Carefully review all offering documents and disclosures;</Text>
              <Text>• Consider your financial situation, investment objectives, and risk tolerance;</Text>
              <Text>• Understand that investments may lose value and you may lose your entire investment.</Text>
            </Box>
            <Text mt={4}>
              Hushh does not provide investment, legal, or tax advice. Any investment decisions you make are solely your responsibility.
            </Text>
          </Box>
          <Divider />

          {/* Account Terms */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              4. Account Terms
            </Heading>
            <Text mb={4}>
              You are responsible for maintaining the security of your account and password. Hushh cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
            </Text>
            <Text mb={4}>
              You agree to:
            </Text>
            <Box pl={4}>
              <Text>• Provide accurate, current, and complete information during registration;</Text>
              <Text>• Maintain and promptly update your account information;</Text>
              <Text>• Keep your password secure and confidential;</Text>
              <Text>• Notify us immediately of any unauthorized use of your account;</Text>
              <Text>• Be responsible for all activities that occur under your account.</Text>
            </Box>
            <Text mt={4}>
              You may not use another person's account without permission. Hushh reserves the right to refuse service, terminate accounts, or remove or edit content at our sole discretion.
            </Text>
          </Box>
          <Divider />

          {/* Prohibited Uses */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              5. Prohibited Uses
            </Heading>
            <Text mb={4}>
              You may not use our Services for any illegal or unauthorized purpose. You agree not to:
            </Text>
            <Box pl={4}>
              <Text>• Violate any laws in your jurisdiction;</Text>
              <Text>• Transmit any worms, viruses, or destructive code;</Text>
              <Text>• Violate or infringe upon the rights of others;</Text>
              <Text>• Collect or harvest personal information from other users;</Text>
              <Text>• Interfere with or disrupt the Services or servers;</Text>
              <Text>• Impersonate any person or entity;</Text>
              <Text>• Use automated systems to access the Services without permission.</Text>
            </Box>
          </Box>
          <Divider />

          {/* Intellectual Property */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              6. Intellectual Property
            </Heading>
            <Text>
              The Services and their original content, features, and functionality are owned by Hushh Technologies LLC and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </Text>
            <Text mt={4}>
              Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Hushh Technologies LLC.
            </Text>
          </Box>
          <Divider />

          {/* Limitation of Liability */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              7. Limitation of Liability
            </Heading>
            <Text>
              In no event shall Hushh Technologies LLC, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </Text>
            <Box pl={4} mt={4}>
              <Text>• Your access to or use of or inability to access or use the Services;</Text>
              <Text>• Any conduct or content of any third party on the Services;</Text>
              <Text>• Any content obtained from the Services;</Text>
              <Text>• Unauthorized access, use, or alteration of your transmissions or content.</Text>
            </Box>
          </Box>
          <Divider />

          {/* Disclaimer */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              8. Disclaimer
            </Heading>
            <Text>
              Your use of the Services is at your sole risk. The Services are provided on an "AS IS" and "AS AVAILABLE" basis. The Services are provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </Text>
            <Text mt={4}>
              Hushh Technologies LLC does not warrant that the Services will function uninterrupted, secure, or available at any particular time or location; that any errors or defects will be corrected; that the Services are free of viruses or other harmful components; or that the results of using the Services will meet your requirements.
            </Text>
          </Box>
          <Divider />

          {/* Modifications */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              9. Modifications to Terms
            </Heading>
            <Text>
              Hushh reserves the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </Text>
            <Text mt={4}>
              What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Services after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Services.
            </Text>
          </Box>
          <Divider />

          {/* Governing Law */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              10. Governing Law
            </Heading>
            <Text>
              These Terms shall be governed and construed in accordance with the laws of the State of Washington, United States, without regard to its conflict of law provisions.
            </Text>
            <Text mt={4}>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
            </Text>
          </Box>
          <Divider />

          {/* Contact Information */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              11. Contact Information
            </Heading>
            <Text mb={4}>
              For questions about these Terms of Service, please contact us at:
            </Text>
            <Box pl={4}>
              <Text>
                <Text as="span" fontWeight="500">Email:</Text> support@hushh.ai
              </Text>
              <Text>
                <Text as="span" fontWeight="500">Phone:</Text> (888) 462-1726
              </Text>
              <Text>
                <Text as="span" fontWeight="500">Address:</Text> 1021 5th St W, Kirkland, WA 98033
              </Text>
            </Box>
          </Box>
          <Divider />

          {/* Acknowledgment */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              12. Acknowledgment
            </Heading>
            <Text>
              By using our Services, you acknowledge that you have read these Terms of Service and agree to be bound by them.
            </Text>
          </Box>
        </VStack>
      </Container>
    </>
  );
};

export default TermsOfServicePage;
