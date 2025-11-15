import React, { useState } from "react";
import { Button, Card, Row, Col, Form } from "react-bootstrap";
import Seo from "@/shared/layout-components/seo/seo";
import axios from "axios";
import { useRouter } from "next/router";

const Add = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    member_id: 1,
    organisation_name: "",
    contact_person: "",
    contact_email: "",
    phone: "",
    website: "",
    address: "",
    logo_url: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle form change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBack = () => {
    router.push("/admin/organizer");
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "/api/v1/organizers/create",
        formData
      );
      alert("Organiser created successfully!");
      router.push("/admin/organizer");
    } catch (err) {
      console.error(err);
      alert("Failed to create organiser");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Add Organiser" />
      <Row className="row-sm mt-4">
        <Col xl={12}>
          <Card>
            <Card.Header>
              <h4 className="card-title mb-0">Add New Organiser</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Organisation Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="organisation_name"
                        value={formData.organisation_name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Person</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Website</Form.Label>
                      <Form.Control
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Logo URL</Form.Label>
                      <Form.Control
                        type="text"
                        name="logo_url"
                        value={formData.logo_url}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Saving..." : "Create Organiser"}
                </Button>

                {/* back to dashboard */}
                <Button variant="secondary" className="my-2" onClick={handleBack}>
                  Back
                </Button>

              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

Add.layout = "Contentlayout";
export default Add;
