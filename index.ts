import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";

// Get configuration for the stack
const config = new pulumi.Config();
const instanceType = config.get("instanceType") as aws.ec2.InstanceType;
const desiredCapacity = config.getNumber("desiredCapacity");
const minSize = config.getNumber("minSize");
const maxSize = config.getNumber("maxSize");
const storageClass = config.get("storageClass") as eks.EBSVolumeType;
const deployDashboard = config.getBoolean("deployDashboard");

// Create a VPC for our cluster.
const vpc = new awsx.ec2.Vpc("eksvpc", {
    subnets: [{ type: "public" }],
});

// Create an EKS cluster with the given configuration.
const cluster = new eks.Cluster("cluster", {
    vpcId: vpc.id,
    subnetIds: vpc.publicSubnetIds,
    instanceType: instanceType,
    desiredCapacity: desiredCapacity,
    minSize: minSize,
    maxSize: maxSize,
    storageClasses: storageClass,
    deployDashboard: deployDashboard,
    version: "1.11",
});

console.log("cluster.instanceRole:");
console.log(cluster.instanceRole);

cluster.eksCluster.roleArn.apply(roleArn => {
    console.log("cluster.eksCluster.roleArn:");
    console.log(roleArn);
});

cluster.core.instanceProfile.role.apply(role => {
    console.log("cluster.core.instanceProfile.role:");
    console.log(role);
});

cluster.core.instanceRoles.apply(instanceRoles => {
    console.log("cluster.core.instanceRoles:");
    console.log(instanceRoles);
});

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;
